const JWT = require('jsonwebtoken');
const { User } = require('../../models/user');
const { ApiKey } = require('../../models/apiKey');
const { Organization } = require('../../models/organization');
const { ADMIN_TOKEN } = require('../constants');
const { Workspace } = require('../../models/workspace');
const SECRET = process.env.JWT_SECRET;

function reqBody(request) {
  return typeof request.body === 'string'
    ? JSON.parse(request.body)
    : request.body;
}

function queryParams(request) {
  return request.query;
}

function makeJWT(info = {}, expiry = '30d') {
  return JWT.sign(info, SECRET, { expiresIn: expiry });
}

function decodeJWT(jwtToken) {
  try {
    return JWT.verify(jwtToken, SECRET);
  } catch {}
  return null;
}

function validSessionForUser(request, response, next) {
  const auth = request.header('Authorization');
  const email = request.header('requester-email');
  const token = auth ? auth.split(' ')[1] : null;

  // If no token present or no email
  if (!token || !email) {
    response.sendStatus(403).end();
    return;
  }

  // If the decode of the JWT fails totally.
  const valid = decodeJWT(token);
  if (!valid) {
    response.sendStatus(403).end();
    return;
  }

  // If the decoded JWT [email] prop does not match the requester header
  if (valid.email.toLowerCase() !== email.toLowerCase()) {
    response.sendStatus(403).end();
    return;
  }

  next();
}

function validAdmin(request, response, next) {
  const auth = request.header('Authorization');
  const token = auth ? auth.split(' ')[1] : null;

  if (token !== ADMIN_TOKEN) {
    response.sendStatus(403).end();
    return;
  }
  next();
}

function getCredentials(request) {
  return {
    organizationId: request.header('X-Org-Id') ?? null,
    workspaceId: request.header('X-Workspace-Id') ?? null,
    apiKey: request.header('X-Api-Key') ?? null,
  };
}

async function validApiToken(request, response, next) {
  const { apiKey } = getCredentials(request);
  if (!apiKey || apiKey.length === 0) {
    response.status(403).json({ error: '[000] No api key present.' });
    return;
  }

  const existingKey = await ApiKey.findByApiKey(apiKey);
  if (!existingKey) {
    response.status(403).json({ error: '[001] Invalid API key.' });
    return;
  }

  const organization = await Organization.findByUid(
    existingKey.organizationUid,
  );
  if (!organization) {
    response.status(403).json({ error: '[002] Invalid API key.' });
    return;
  }

  next();
}

async function organizationFromToken(request) {
  const { organizationId } = getCredentials(request);
  if (!organizationId) return null;

  const organization = await Organization.findByOrgId(organizationId);
  return organization;
}

async function workspaceFromToken(request) {
  const { workspaceId } = getCredentials(request);
  if (!workspaceId) return null;

  const workspace = await Workspace.findByWorkspaceId(workspaceId);
  return workspace;
}

async function userFromSession(request) {
  const auth = request.header('Authorization');
  const email = request.header('requester-email');
  const token = auth ? auth.split(' ')[1] : null;

  if (!token || !email) {
    return null;
  }

  const valid = decodeJWT(token);
  if (!valid) {
    return null;
  }

  const user = await User.findByUid(valid.uid);
  return user;
}

function userIdFromSession(request) {
  const auth = request.header('Authorization');
  const email = request.header('requester-email');
  const token = auth ? auth.split(' ')[1] : null;

  if (!token || !email) {
    return null;
  }

  const valid = decodeJWT(token);
  if (!valid) {
    return null;
  }

  return valid.uid;
}

module.exports = {
  reqBody,
  queryParams,
  makeJWT,
  validAdmin,
  validSessionForUser,
  userFromSession,
  userIdFromSession,
  validApiToken,
  getCredentials,
  organizationFromToken,
  workspaceFromToken,
};
