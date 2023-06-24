const express = require('express');
const app = express();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Document } = require('../../models/document');
const {
  reqBody,
  validApiToken,
  getCredentials,
  organizationFromToken,
  workspaceFromToken,
} = require('../../utils/http');
const { DocumentFragment } = require('../../models/documentFragment');
const { exportFile, readJSON } = require('../../utils/storage');
const { Workspace } = require('../../models/workspace');
const { Organization } = require('../../models/organization');
app.use(cors({ origin: true }));

app.get('/ping', function (_, response) {
  response.sendStatus(200).end();
});

// Validate API Token for Organization
// X-Org-Id
// X-Workspace-Id (optional)
// X-Api-Key
app.use('/v1/*', validApiToken);

app.post('/v1/create-root-document', async function (request, response) {
  const { organizationId, workspaceId } = getCredentials(request);
  const body = reqBody(request);

  if (!body.documentName) {
    response.sendStatus(422).json({ error: 'No document name provided.' });
    return;
  }

  const document = await Document.createNew({
    documentName: body.documentName,
    workspaceId,
    organizationId,
  });

  try {
    const organization = await organizationFromToken(request);
    await Organization.updateTimestamp(organization.uid);
    const workspace = await workspaceFromToken(request);
    await Workspace.updateTimestamp(workspace.uid);
  } catch {}

  response.status(200).json({ document });
});

app.post(
  '/v1/append-workspace-document-packet',
  async function (request, response) {
    const { organizationId, workspaceId } = getCredentials(request);
    const { docId, order, packet } = reqBody(request);

    const document = await Document.byId(docId);
    if (!document) {
      response
        .sendStatus(404)
        .json({ error: `No document found with id ${docId}.` });
      return;
    }

    const filepath = `fragments/${
      document.uid
    }/fragment_${order}-${uuidv4()}.cjson`;
    await exportFile(
      filepath,
      JSON.stringify(packet),
      'application/json',
      true,
    );
    const fragment = await DocumentFragment.createNew({
      documentId: docId,
      order,
      workspaceId,
      organizationId,
      filepath,
    });

    response.status(200).json({ fragment: fragment.uid });
  },
);

app.get(
  '/v1/:documentId/conclude-workspace-document-sync',
  async function (request, response) {
    const { documentId } = request.params;
    const document = await Document.byId(documentId);
    if (!document) {
      response.status(404).json({ msg: 'noop' });
      return;
    }
    await Document.updateQuick(documentId, {
      readyForCache: true,
      cacheFilepath: null,
    });
    response.status(200).json({ msg: 'noop' });
  },
);

// Get all documents in Organization.
app.get('/v1/documents/all', async function (request, response) {
  const organization = await organizationFromToken(request);
  const documents = (
    await Document.byOrg(organization.uid, organization.orgId)
  ).map((document) => {
    delete document.readyForCache;
    delete document.cacheFilepath;
    delete document.organizationUid;

    delete document.workspace.uid;
    delete document.workspace.admins;
    delete document.workspace.orgUid;

    return document;
  });

  response.status(200).json({ documents });
});

// Get all documents in Org/Workspace
app.get('/v1/documents/workspace', async function (request, response) {
  const workspace = await workspaceFromToken(request);
  const documents = (await Document.byWorkspace(workspace.workspaceId)).map(
    (document) => {
      delete document.readyForCache;
      delete document.cacheFilepath;
      delete document.organizationUid;

      delete document?.workspace?.uid;
      delete document?.workspace?.admins;
      delete document?.workspace?.orgUid;

      return document;
    },
  );
  response.status(200).json({ documents });
});

app.get(
  '/v1/documents/:documentUid/vector-ids',
  async function (request, response) {
    const { documentUid } = request.params;
    const vectorIds = await Document.vectorIds(documentUid);
    response.status(200).json({ ids: vectorIds });
  },
);

app.get('/v1/documents/:documentUid/cache', async function (request, response) {
  const { documentUid } = request.params;
  const document = await Document.byId(documentUid);
  const cache = await readJSON(document.cacheFilepath);
  response.status(200).json({ ...cache });
});

app.delete('/v1/documents/workspace', async function (request, response) {
  const workspace = await workspaceFromToken(request);
  await Document.deleteByWorkspace(workspace.workspaceId);
  await Workspace.updateTimestamp(workspace.uid);
  response.status(200).json({ msg: 'ok' });
});

app.delete('/v1/documents/:documentUid', async function (request, response) {
  const { documentUid } = request.params;
  await Document.deleteByUid(documentUid);
  response.status(200).json({ msg: 'ok' });
});

module.exports.apiEndpoints = app;
