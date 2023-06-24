const admin = require('firebase-admin');
const fetch = require('node-fetch');
const brotli = require('brotli');
const { v4: uuidv4 } = require('uuid');
const { STORAGE_BASE } = require('../constants');

async function exportFile(
  filenamePath,
  dataString,
  contentType = 'text/plain',
  compress = false,
) {
  let fileBuffer = Buffer.from(dataString, 'utf8');
  if (compress) {
    fileBuffer = brotli.compress(fileBuffer, { mode: 2 });
  }
  const token = uuidv4();
  const options = {
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  };

  await admin.storage().bucket().file(filenamePath).save(fileBuffer, options);
}

// Assuming filepath to file starting with / all / after first forward-slash will be encoded.
async function readJSON(filenamePath, nullResult = null) {
  try {
    const response = await fetch(
      `${STORAGE_BASE}/${encodeURIComponent(filenamePath)}?alt=media`,
    );

    if (filenamePath.includes('.cjson')) {
      const buffer = await response.buffer();
      const stream = brotli.decompress(buffer);
      const data = Buffer.from(stream).toString('utf-8');
      return JSON.parse(data);
    } else {
      const json = await response.json();
      return json;
    }
  } catch (e) {
    console.error(e.message);
    return nullResult;
  }
}

async function readFile(filenamePath) {
  const response = await fetch(
    `${STORAGE_BASE}/${encodeURIComponent(filenamePath)}?alt=media`,
  );
  const text = await response.text();
  return text;
}


async function fetchMetadata(filenamePath) {
  return await fetch(
    `${STORAGE_BASE}/${encodeURIComponent(filenamePath)}`,
  )
    .then(res => res.json())
}

module.exports = {
  exportFile,
  readJSON,
  readFile,
  fetchMetadata,
};
