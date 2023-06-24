const express = require('express');
const app = express();
const cors = require('cors');
const { User } = require('../../models/user');
const {
  reqBody,
  makeJWT,
  validSessionForUser,
  userFromSession,
} = require('../../utils/http');
const { sendAuthEmail, authStytchToken } = require('../../utils/stytch');
const { Organization } = require('../../models/organization');
const { Document } = require('../../models/document');
const { Workspace } = require('../../models/workspace');
const { ApiKey } = require('../../models/apiKey');
const { DocumentFragment } = require('../../models/documentFragment');
const { readJSON } = require('../../utils/storage');
const { addToDemo } = require('../../support/addToDemo');
app.use(cors({ origin: true }));

app.get('/heartbeat', function (_, response) {
  response.sendStatus(200).end();
});

app.post('/login-with-email', async function (request, response) {
  const { emailAddress } = reqBody(request);

  const res = await sendAuthEmail({ email: emailAddress });
  if (!res) {
    response
      .status(402)
      .json({ user: null, error: '[003] Could not send authentication email' });
    return;
  }

  const { stytchUserId, stytchEmailId } = res;
  const user = await User.createOrFind(
    emailAddress,
    stytchUserId,
    stytchEmailId,
  );
  response.status(200).json({ user });
});

app.post('/create-session', async function (request, response) {
  const { token } = reqBody(request);
  const res = await authStytchToken(token);
  if (!res) {
    response.status(403).end();
    return;
  }

  const user = await User.findByStytchId(res.user_id);
  if (!user) {
    response.status(403).end();
    return;
  }

  await addToDemo(user);
  const newToken = makeJWT({ uid: user.uid, email: user.email, token });
  return response.status(200).json({ token: newToken, user });
});

app.use('/v1/*', validSessionForUser);

app.get('/v1/valid-session-token', async function (request, response) {
  const user = await userFromSession(request);
  if (!user) {
    response.sendStatus(403).end();
    return;
  }

  response.sendStatus(200).end();
});

app.post('/v1/create-org', async function (request, response) {
  const { orgName } = reqBody(request);
  const user = await userFromSession(request);
  if (!user) {
    response.sendStatus(403).end();
    return;
  }

  const organization = await Organization.createNew(user.uid, {
    name: orgName,
  });
  if (!organization) {
    response
      .status(200)
      .json({ organization: null, error: 'Failed to create organization.' });
    return;
  }

  response.status(200).json({ organization, error: null });
});

app.get('/v1/orgs', async function (request, response) {
  const user = await userFromSession(request);
  if (!user) {
    response.sendStatus(403).end();
    return;
  }
  const organizations = await Organization.byOwner(user.uid);
  response.status(200).json({ organizations, error: null });
});

app.get('/v1/org/:slug', async function (request, response) {
  const { slug } = request.params;
  const user = await userFromSession(request);
  if (!user) {
    response.sendStatus(403).end();
    return;
  }
  const organization = await Organization.findBySlugWithOwner(
    user.uid,
    slug.toLowerCase(),
  );
  if (!organization) {
    response
      .status(200)
      .json({ organization: null, error: 'No org by that slug.' });
    return;
  }

  response.status(200).json({ organization, error: null });
});

app.get(
  '/v1/org/:slug/statistics/documents',
  async function (request, response) {
    const { slug } = request.params;
    const user = await userFromSession(request);
    if (!user) {
      response.status(200).json({ value: null });
      return;
    }
    const organization = await Organization.findBySlugWithOwner(
      user.uid,
      slug.toLowerCase(),
    );
    if (!organization) {
      response.status(200).json({ value: null });
      return;
    }
    const value = await Document.countForOrg(organization.orgId);
    response.status(200).json({ value });
  },
);

app.get('/v1/org/:slug/statistics/vectors', async function (request, response) {
  const { slug } = request.params;
  const user = await userFromSession(request);
  if (!user) {
    response.status(200).json({ value: null });
    return;
  }

  const organization = await Organization.findBySlugWithOwner(
    user.uid,
    slug.toLowerCase(),
  );
  if (!organization) {
    response.status(200).json({ value: null });
    return;
  }

  const value = await Document.calcVectors(organization.orgId);
  response.status(200).json({ value });
});

app.get(
  '/v1/org/:slug/statistics/cache-size',
  async function (request, response) {
    const { slug } = request.params;
    const user = await userFromSession(request);
    if (!user) {
      response.status(200).json({ value: null });
      return;
    }

    const organization = await Organization.findBySlugWithOwner(
      user.uid,
      slug.toLowerCase(),
    );
    if (!organization) {
      response.status(200).json({ value: null });
      return;
    }

    const value = await Document.calcVectorCache(organization.orgId);
    response.status(200).json({ value });
  },
);

app.get('/v1/orgs/workspaces', async function (request, response) {
  const user = await userFromSession(request);
  if (!user) {
    response.status(200).json({ value: null });
    return;
  }

  const organizations = await Organization.byOwner(user.uid);
  if (!organizations?.length === 0) {
    response.status(200).json({ value: null });
    return;
  }

  const orgUids = organizations.map((org) => org.uid);
  const workspaces = await Workspace.byOrgUids(orgUids, true);
  response.status(200).json({ workspaces });
});

app.get('/v1/org/:slug/documents', async function (request, response) {
  const { slug } = request.params;
  const user = await userFromSession(request);
  if (!user) {
    response.status(200).json({ documents: [] });
    return;
  }

  const organization = await Organization.findBySlugWithOwner(
    user.uid,
    slug.toLowerCase(),
  );
  if (!organization) {
    response.status(200).json({ documents: [] });
    return;
  }

  const documents = await Document.byOrg(organization.uid, organization.orgId);
  response.status(200).json({ documents });
});

app.get('/v1/org/:slug/workspaces', async function (request, response) {
  const { slug } = request.params;
  const user = await userFromSession(request);
  if (!user) {
    response.status(200).json({ documents: [] });
    return;
  }

  const organization = await Organization.findBySlugWithOwner(
    user.uid,
    slug.toLowerCase(),
  );
  if (!organization) {
    response.status(200).json({ documents: [] });
    return;
  }

  const workspaces = await Workspace.byOrgUid(organization.uid);
  response.status(200).json({ workspaces });
});

app.get(
  '/v1/org/:slug/workspace/:workspaceSlug/documents',
  async function (request, response) {
    const { slug, workspaceSlug } = request.params;
    const user = await userFromSession(request);
    if (!user) {
      response.status(200).json({ documents: [] });
      return;
    }

    const organization = await Organization.findBySlugWithOwner(
      user.uid,
      slug.toLowerCase(),
    );
    const workspace = await Workspace.findBySlugInOrg(
      workspaceSlug,
      organization.uid,
    );
    if (!organization || !workspace) {
      response.status(200).json({ documents: [] });
      return;
    }

    const documents = await Document.byWorkspace(workspace.workspaceId);
    response.status(200).json({ documents });
  },
);

app.get(
  '/v1/org/:slug/workspace/:workspaceSlug/statistics/documents',
  async function (request, response) {
    const { slug, workspaceSlug } = request.params;
    const user = await userFromSession(request);
    if (!user) {
      response.status(200).json({ value: null });
      return;
    }

    const organization = await Organization.findBySlugWithOwner(
      user.uid,
      slug.toLowerCase(),
    );
    const workspace = await Workspace.findBySlugInOrg(
      workspaceSlug,
      organization.uid,
    );
    if (!organization || !workspace) {
      response.status(200).json({ documents: [] });
      return;
    }

    const value = await Document.countForWorkspace(workspace.workspaceId);
    response.status(200).json({ value });
  },
);

app.get(
  '/v1/org/:slug/workspace/:workspaceSlug/statistics/vectors',
  async function (request, response) {
    const { slug, workspaceSlug } = request.params;
    const user = await userFromSession(request);
    if (!user) {
      response.status(200).json({ value: null });
      return;
    }

    const organization = await Organization.findBySlugWithOwner(
      user.uid,
      slug.toLowerCase(),
    );
    const workspace = await Workspace.findBySlugInOrg(
      workspaceSlug,
      organization.uid,
    );
    if (!organization || !workspace) {
      response.status(200).json({ documents: [] });
      return;
    }

    const value = await Document.calcVectorsWorkspace(workspace.workspaceId);
    response.status(200).json({ value });
  },
);

app.get(
  '/v1/org/:slug/workspace/:workspaceSlug/statistics/cache-size',
  async function (request, response) {
    const { slug, workspaceSlug } = request.params;
    const user = await userFromSession(request);
    if (!user) {
      response.status(200).json({ value: null });
      return;
    }

    const organization = await Organization.findBySlugWithOwner(
      user.uid,
      slug.toLowerCase(),
    );
    const workspace = await Workspace.findBySlugInOrg(
      workspaceSlug,
      organization.uid,
    );
    if (!organization || !workspace) {
      response.status(200).json({ documents: [] });
      return;
    }

    const value = await Document.calcVectorCacheWorkspace(
      workspace.workspaceId,
    );
    response.status(200).json({ value });
  },
);

app.get('/v1/org/:slug/api-key', async function (request, response) {
  const { slug } = request.params;
  const user = await userFromSession(request);
  if (!user) {
    response.status(200).json({ documents: [] });
    return;
  }

  const organization = await Organization.findBySlugWithOwner(
    user.uid,
    slug.toLowerCase(),
  );
  if (!organization) {
    response.status(200).json({ documents: [] });
    return;
  }

  const apiKey = await ApiKey.findByOrgUid(organization.uid);
  response.status(200).json({ apiKey });
});

app.post('/v1/org/:slug/new-workspace', async function (request, response) {
  const { slug } = request.params;
  const { workspaceName } = reqBody(request);
  const user = await userFromSession(request);
  if (!user) {
    response.status(403).end();
    return;
  }

  const organization = await Organization.findBySlugWithOwner(
    user.uid,
    slug.toLowerCase(),
  );
  if (!organization) {
    response.status(404).end();
    return;
  }

  const workspace = await Workspace.createNew(user.uid, {
    name: workspaceName,
    orgUid: organization.uid,
  });

  response.status(200).json({ workspace });
});

app.get('/v1/document/:docUid/fragments', async function (request, response) {
  const { docUid } = request.params;
  const user = await userFromSession(request);
  if (!user) {
    response.status(403).end();
    return;
  }

  const document = await Document.byId(docUid);
  if (!document) {
    response.status(404).end();
    return;
  }

  const fragments = await DocumentFragment.byDoc(docUid);
  response.status(200).json({ fragments });
});

app.get(
  '/v1/document/:docUid/fragment/:order',
  async function (request, response) {
    const { docUid, order } = request.params;
    const user = await userFromSession(request);
    if (!user) {
      response.status(403).end();
      return;
    }

    const fragment = await DocumentFragment.byDocAndOrder(
      docUid,
      Number(order),
    );
    if (!fragment) {
      response.status(404).end();
      return;
    }
    const data = await readJSON(fragment.filepath);
    response.status(200).json({ ...data });
  },
);

module.exports.frontendApi = app;
