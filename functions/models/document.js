const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { readJSON, fetchMetadata } = require('../utils/storage');

const Document = {
  collection: 'documents',
  baseRecord: {
    documentName: null,
    workspaceId: null,
    organizationId: null,
    createdAt: FieldValue.serverTimestamp(),
  },
  db: async function () {
    return await getFirestore();
  },
  createNew: async function (inputs = {}) {
    const newDocument = await (
      await this.db()
    )
      .collection(this.collection)
      .add({
        ...this.baseRecord,
        ...inputs,
      })
      .then((docRef) => {
        return {
          uid: docRef.id,
          ...this.baseRecord,
          ...inputs,
        };
      });

    return newDocument;
  },
  byId: async function (docId) {
    const existingDocument = await (
      await this.db()
    )
      .collection(this.collection)
      .doc(docId)
      .get()
      .then((doc) => {
        if (!doc.exists) return null;
        return { uid: doc.id, ...doc.data() };
      });
    return existingDocument;
  },
  updateQuick: async function (docId, updates) {
    if (!docId) {
      return null;
    }

    await (
      await this.db()
    )
      .collection(this.collection)
      .doc(docId)
      .update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });
    return true;
  },
  byOrg: async function (orgUid, organizationId) {
    const { Workspace } = require('./workspace');
    const documents = await (
      await this.db()
    )
      .collection(this.collection)
      .where('organizationId', '==', organizationId)
      .get()
      .then((results) => {
        return results.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    const workspaces = await Workspace.byOrgUid(orgUid);
    for (const document of documents) {
      try {
        document.workspace = workspaces.find(
          (workspace) => workspace.workspaceId === document.workspaceId,
        );
        document.organizationUid = orgUid;
      } catch (e) {
        console.error(e);
      }
    }

    return documents;
  },
  countForOrg: async function (organizationId) {
    return await (
      await this.db()
    )
      .collection(this.collection)
      .where('organizationId', '==', organizationId)
      .get()
      .then((snapshot) => {
        return snapshot.size;
      });
  },
  calcVectors: async function (organizationId) {
    const documents = await (
      await this.db()
    )
      .collection(this.collection)
      .where('organizationId', '==', organizationId)
      .get()
      .then((results) => {
        return results.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    var vectorCount = 0;
    for (const document of documents) {
      try {
        const cache = await readJSON(document.cacheFilepath);
        vectorCount += cache.vectors.length;
      } catch (e) {
        console.error(e);
      }
    }

    return vectorCount;
  },
  calcVectorCache: async function (organizationId) {
    const documents = await (
      await this.db()
    )
      .collection(this.collection)
      .where('organizationId', '==', organizationId)
      .get()
      .then((results) => {
        return results.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    var totalBytes = 0;
    for (const document of documents) {
      try {
        const metadata = await fetchMetadata(document.cacheFilepath);
        totalBytes += Number(metadata?.size);
      } catch (e) {
        console.error(e);
      }
    }

    return totalBytes;
  },
  byWorkspace: async function (workspaceId) {
    const documents = await (
      await this.db()
    )
      .collection(this.collection)
      .where('workspaceId', '==', workspaceId)
      .get()
      .then((results) => {
        return results.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    return documents;
  },
  countForWorkspace: async function (workspaceId) {
    return await (
      await this.db()
    )
      .collection(this.collection)
      .where('workspaceId', '==', workspaceId)
      .get()
      .then((snapshot) => {
        return snapshot.size;
      });
  },
  calcVectorsWorkspace: async function (workspaceId) {
    const documents = await (
      await this.db()
    )
      .collection(this.collection)
      .where('workspaceId', '==', workspaceId)
      .get()
      .then((results) => {
        return results.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    var vectorCount = 0;
    for (const document of documents) {
      try {
        const cache = await readJSON(document.cacheFilepath);
        vectorCount += cache.vectors.length;
      } catch (e) {
        console.error(e);
      }
    }

    return vectorCount;
  },
  calcVectorCacheWorkspace: async function (workspaceId) {
    const documents = await (
      await this.db()
    )
      .collection(this.collection)
      .where('workspaceId', '==', workspaceId)
      .get()
      .then((results) => {
        return results.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    var totalBytes = 0;
    for (const document of documents) {
      try {
        const metadata = await fetchMetadata(document.cacheFilepath);
        totalBytes += Number(metadata?.size);
      } catch (e) {
        console.error(e);
      }
    }

    return totalBytes;
  },
  deleteByWorkspace: async function (workspaceId) {
    const db = await this.db();
    const documents = await this.byWorkspace(workspaceId);
    if (documents.length === 0) return;

    const batch = db.batch();
    documents.forEach((doc) => {
      const ref = db.collection(this.collection).doc(doc.uid);
      ref.delete();
    });

    await batch.commit();
    return;
  },
  deleteByUid: async function (documentUid) {
    await (await this.db())
      .collection(this.collection)
      .doc(documentUid)
      .delete();
    return;
  },
  vectorIds: async function (documentUid) {
    const document = await (
      await this.db()
    )
      .collection(this.collection)
      .doc(documentUid)
      .get()
      .then((res) => {
        if (!res.exists) return null;
        return { uid: res.id, ...res.data() };
      });
    if (!document) return [];

    try {
      const cache = await readJSON(document.cacheFilepath);
      return cache.ids;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
};

module.exports.Document = Document;
