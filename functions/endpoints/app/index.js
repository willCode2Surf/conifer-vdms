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

module.exports.frontendApi = app;
