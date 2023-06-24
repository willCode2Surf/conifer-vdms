require('dotenv').config();
const stytch = require('stytch');
const { User } = require('../../models/user');

const ENV = process.env.FUNCTIONS_EMULATOR === 'true' ? 'test' : 'live';
const PROJECT = process.env.STYTCH_PROJECT_ID;
const SECRET = process.env.STYTCH_SECRET;

const Stytch = new stytch.Client({
  project_id: PROJECT,
  secret: SECRET,
  env: stytch.envs[ENV],
});

const LOGIN_PATH =
  process.env.FUNCTIONS_EMULATOR === 'true'
    ? 'http://localhost:3000/authenticate/stytch'
    : 'https://conifer-tools.web.app/authenticate/stytch';

async function sendAuthEmail({ email }) {
  if (!email) return false;
  try {
    const res = await Stytch.magicLinks.email
      .loginOrCreate({
        email,
        login_magic_link_url: LOGIN_PATH,
        signup_magic_link_url: LOGIN_PATH,
      })
      .then((res) => {
        if (res.status_code !== 200) {
          throw `Stytch::sendAuthEmail failed for ${email}!`;
        }
        return res;
      })
      .catch((err) => {
        console.error(err);
        return null;
      });

    if (res === null) return false;

    const {
      user_id: stytchUserId,
      email_id: stytchEmailId,
      user_created: userCreated,
    } = res;
    return { stytchUserId, stytchEmailId, userCreated };
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function inviteUser({ email }) {
  if (!email) return false;

  try {
    const existingUser = await User.findByEmail(email);
    if (!!existingUser) {
      throw `Stytch::inviteUser user already exists for ${email}!`;
    }

    const res = await Stytch.magicLinks.email
      .invite({
        email,
        invite_magic_link_url: LOGIN_PATH,
      })
      .then((res) => {
        if (res.status_code !== 200) {
          throw `Stytch::inviteUser failed for ${email}!`;
        }
        return res;
      })
      .catch((err) => {
        console.error(err);
        return null;
      });

    if (res === null) return false;

    const { user_id: stytchUserId, email_id: stytchEmailId } = res;
    return { stytchUserId, stytchEmailId };
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function authStytchToken(token = null) {
  if (!token) return null;

  try {
    const res = await Stytch.magicLinks
      .authenticate(token)
      .then((res) => res)
      .catch((err) => {
        console.error(err);
        return false;
      });
    return res;
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = {
  sendAuthEmail,
  authStytchToken,
  inviteUser,
};
