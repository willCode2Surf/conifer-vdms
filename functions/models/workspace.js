const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const uuidAPIKey = require('uuid-apikey');
const slugify = require('slugify');

const Workspace = {
  collection: 'workspaces',
  baseRecord: {
    admins: [],
    slug: null,
    name: null,
    orgUid: null,
    workspaceId: `workspace-${uuidAPIKey.create().apiKey}`,
    createdAt: FieldValue.serverTimestamp(),
  },
  db: async function () {
    return await getFirestore();
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
    return newOrg;
  },
  byOrgUid: async function (orgUid) {
    const workspaces = await (
      await this.db()
    )
      .collection(this.collection)
      .where('orgUid', '==', orgUid)
      .get()
      .then((result) => {
        if (result.docs.length === 0) return [];
        return result.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    return workspaces;
  },
  byOrgUids: async function (orgUids = [], includeMetrics = false) {
    const workspaces = await (
      await this.db()
    )
      .collection(this.collection)
      .where('orgUid', 'in', orgUids)
      .get()
      .then((result) => {
        if (result.docs.length === 0) return [];
        return result.docs.map((doc) => {
          return { uid: doc.id, ...doc.data() };
        });
      });

    if (includeMetrics) {
      const { Document } = require('./document');
      for (const workspace of workspaces) {
        workspace.documents = await Document.countForWorkspace(
          workspace.workspaceId,
        );
      }
    }

    return workspaces;
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
  findBySlugInOrg: async function (slug, orgUid) {
    const org = await (
      await this.db()
    )
      .collection(this.collection)
      .where('slug', '==', slug)
      .where('orgUid', '==', orgUid)
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

module.exports.Workspace = Workspace;
