const express = require('express');
const app = express();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Document } = require('../../models/document');
const {
  reqBody,
  makeJWT,
  validSessionForUser,
  userFromSession,
} = require('../../utils/http');
const { DocumentFragment } = require('../../models/documentFragment');
const { exportFile } = require('../../utils/storage');
app.use(cors({ origin: true }));

app.get('/ping', function (_, response) {
  response.sendStatus(200).end();
});

// Validate API Token for Organization
// X-Org-Id
// X-Workspace-Id
// X-Api-Key
// app.use('/v1/*', validSessionForUser);

app.post('/v1/create-root-document', async function (request, response) {
  const organizationId = request.header('X-Org-Id') ?? null;
  const workspaceId = request.header('X-Workspace-Id') ?? null;
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

  response.status(200).json({ document });
});

app.post(
  '/v1/append-workspace-document-packet',
  async function (request, response) {
    const organizationId = request.header('X-Org-Id') ?? null;
    const workspaceId = request.header('X-Workspace-Id') ?? null;
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

module.exports.apiEndpoints = app;
