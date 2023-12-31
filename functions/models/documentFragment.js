const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const DocumentFragment = {
  collection: 'document_fragments',
  baseRecord: {
    documentId: null,
    workspaceId: null,
    organizationId: null,
    filepath: null,
    order: 0,
    createdAt: FieldValue.serverTimestamp(),
  },
  db: async function () {
    return await getFirestore();
  },
  createNew: async function (inputs = {}) {
    const newFragment = await (
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

    return newFragment;
  },
  byDoc: async function (docId = '') {
    const fragments = await (
      await this.db()
    )
      .collection(this.collection)
      .where('documentId', '==', docId)
      .orderBy('order', 'ASC')
      .get()
      .then((result) => {
        if (result.docs.length === 0) return [];
        return result.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });
    return fragments;
  },
  byDocAndOrder: async function (docId = '', order = 0) {
    const fragment = await (
      await this.db()
    )
      .collection(this.collection)
      .where('documentId', '==', docId)
      .where('order', '==', Number(order))
      .get()
      .then((result) => {
        if (result.docs.length === 0) return null;
        const doc = result.docs[0];
        return { uid: doc.id, ...doc.data() };
      });
    return fragment;
  },
};

module.exports.DocumentFragment = DocumentFragment;
