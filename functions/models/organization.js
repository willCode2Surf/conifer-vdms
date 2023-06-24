const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const uuidAPIKey = require('uuid-apikey');
const slugify = require('slugify');
const { ApiKey } = require('./apiKey');

const Organization = {
  collection: 'organizations',
  baseRecord: {
    admins: [],
    slug: null,
    name: null,
    orgId: null,
    createdAt: FieldValue.serverTimestamp(),
  },
  db: async function () {
    return await getFirestore();
  },
  makeKey: () => {
    return `org-${uuidAPIKey.create().apiKey}`;
  },
  createNew: async function (ownerUid, inputs = {}) {
    var slug = slugify(inputs.name, { lower: true });
    const existingBySlug = await this.findBySlug(slug);

    if (!!existingBySlug) {
      const slugSeed = Math.floor(10000000 + Math.random() * 90000000);
      slug = slugify(`${inputs.name}-${slugSeed}`, { lower: true });
    }

    const recordData = {
      ...this.baseRecord,
      admins: [ownerUid],
      slug,
      ...inputs,
      orgId: this.makeKey(),
    };

    const newOrg = await (
      await this.db()
    )
      .collection(this.collection)
      .add(recordData)
      .then((docRef) => {
        return {
          uid: docRef.id,
          ...recordData,
        };
      });

    await ApiKey.createNew({
      organizationUid: newOrg.uid,
      createdBy: ownerUid,
    });

    return newOrg;
  },
  findByUid: async function (uid) {
    const org = await (
      await this.db()
    )
      .collection(this.collection)
      .doc(uid)
      .get()
      .then((result) => {
        if (!result.data()) return null;
        return { uid, ...result.data() };
      });

    return org;
  },
  byOwner: async function (userUid) {
    const orgs = await (
      await this.db()
    )
      .collection(this.collection)
      .where('admins', 'array-contains', userUid)
      .get()
      .then((result) => {
        if (result.docs.length === 0) return [];
        return result.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });
    return orgs;
  },
  findBySlug: async function (slug) {
    const org = await (
      await this.db()
    )
      .collection(this.collection)
      .where('slug', '==', slug)
      .get()
      .then((result) => {
        if (result.docs.length === 0) return null;
        const doc = result.docs[0];
        return { uid: doc.id, ...doc.data() };
      });
    return org;
  },
  findByOrgId: async function (orgId) {
    const org = await (
      await this.db()
    )
      .collection(this.collection)
      .where('orgId', '==', orgId)
      .get()
      .then((result) => {
        if (result.docs.length === 0) return null;
        const doc = result.docs[0];
        return { uid: doc.id, ...doc.data() };
      });
    return org;
  },
  findBySlugWithOwner: async function (ownerUid, slug) {
    const org = await (
      await this.db()
    )
      .collection(this.collection)
      .where('slug', '==', slug)
      .where('admins', 'array-contains', ownerUid)
      .get()
      .then((result) => {
        if (result.docs.length === 0) return null;
        const doc = result.docs[0];
        return { uid: doc.id, ...doc.data() };
      });
    return org;
  },
  updateQuick: async function (orgUid, updates) {
    if (!orgUid) {
      return null;
    }

    await (
      await this.db()
    )
      .collection(this.collection)
      .doc(orgUid)
      .update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });
    return true;
  },
};

module.exports.Organization = Organization;
