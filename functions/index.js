/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { frontendApi } = require('./endpoints/app');
initializeApp();

exports.frontend = onRequest(
  {
    timeoutSeconds: 120,
    memory: '1GB',
    maxInstances: 25,
  },
  frontendApi,
);
