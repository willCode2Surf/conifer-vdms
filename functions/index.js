/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { onRequest } = require('firebase-functions/v2/https');
const { frontendApi } = require('./endpoints/app');
const { apiEndpoints } = require('./endpoints/api');
const { cacheDocumentVectors } = require('./support/cacheDocumentVectors');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
initializeApp();

exports.frontend = onRequest(
  {
    timeoutSeconds: 60,
    memory: '1GB',
    maxInstances: 25,
  },
  frontendApi,
);

exports.api = onRequest(
  {
    timeoutSeconds: 120,
    memory: '2GB',
    maxInstances: 25,
  },
  apiEndpoints,
);

exports.assembleDocumentVectorCachefile = functions
  .runWith({
    timeoutSeconds: 120,
    maxInstances: 5,
    memory: '2GB',
  })
  .firestore.document('documents/{documentId}')
  .onUpdate((change, context) => cacheDocumentVectors(change, context));
