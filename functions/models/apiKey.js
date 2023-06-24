const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const uuidAPIKey = require('uuid-apikey');

const ApiKey = {
  collection: 'api_keys',
  baseRecord: {
    organizationUid: null,
    key: `ck-${uuidAPIKey.create().apiKey}`,
    createdBy: null,
    createdAt: FieldValue.serverTimestamp(),
  },
  db: async function () {
    return await getFirestore();
  },
  createNew: async function (inputs = {}) {
    const newOrg = await (
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

    return newOrg;
  },
  findByOrgUid: async function (orgUid = '') {
    const record = await (
      await this.db()
    )
      .collection(this.collection)
      .where('organizationUid', '==', orgUid)
      .get()
      .then((result) => {
        if (!result.docs.length === 0) return null;
        const doc = result.docs[0];
        return { uid: doc.id, ...doc.data() };
      });

    return record;
  },
  findByApiKey: async function (key = '') {
    const record = await (
      await this.db()
    )
      .collection(this.collection)
      .where('key', '==', key)
      .get()
      .then((result) => {
        if (!result.docs.length === 0) return null;
        const doc = result.docs[0];
        return { uid: doc.id, ...doc.data() };
      });

    return record;
  },
};

module.exports.ApiKey = ApiKey;
