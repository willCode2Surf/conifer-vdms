const { Document } = require("../models/document");
const { DocumentFragment } = require("../models/documentFragment");
const { readJSON, exportFile } = require("../utils/storage");
const { v5: uuidv5 } = require('uuid')

async function cacheDocumentVectors(change, context) {
  const before = change.before.data().readyForCache
  const after = change.after.data().readyForCache

  if ((before === after) || !after) return;
  const docId = context.params.documentId;
  const document = await Document.byId(docId);
  if (!document) return;

  const fragments = await DocumentFragment.byDoc(docId);
  if (fragments.length === 0) return;

  const combinedData = {
    ids: [],
    vectors: [],
    metadatas: [],
  }

  for (const fragment of fragments) {
    const partition = await readJSON(fragment.filepath);
    combinedData.ids = [...combinedData.ids, ...partition.ids];
    combinedData.vectors = [...combinedData.vectors, ...partition.vectors];
    combinedData.metadatas = [...combinedData.metadatas, ...partition.metadatas];
  }

  const cacheFilepath = `vector-cache/${docId}/${uuidv5(`file://${document.uid}`, uuidv5.URL)}.cjson`;
  await exportFile(cacheFilepath, JSON.stringify(combinedData), 'application/json', true);

  await Document.updateQuick(docId, { readyForCache: false, cacheFilepath })
  return;
}

module.exports.cacheDocumentVectors = cacheDocumentVectors;