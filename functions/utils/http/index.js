const JWT = require('jsonwebtoken');
const { User } = require('../../models/user');
const { ADMIN_TOKEN } = require('../constants');
const SECRET = 'qkThPRGjeipA61JkVIjDatGQ2hB1YaTV';

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

// Used for when Mintplex backend needs to mark a claim as redeemed
const MF_CLAIM_HEADER = 'x-mintfoundry-claims';
const MF_CLAIM_AUTH =
  'Kykle4l3abqQ2IzAXJ839yvbkmzxcDmg5n07UaIrtZTySdLabXLcs/VHl9IPnVZ1';
function validClaimRequest(request) {
  const auth = request.header(MF_CLAIM_HEADER);
  return !!auth && auth === MF_CLAIM_AUTH;
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
  validClaimRequest,
  userFromSession,
  userIdFromSession,
};
