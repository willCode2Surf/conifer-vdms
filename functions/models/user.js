const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const User = {
  collection: 'users',
  baseRecord: {
    name: null,
    email: null,
    stytchUserId: null,
    stytchEmailId: null,
    createdAt: FieldValue.serverTimestamp(),
  },
  db: async function () {
    return await getFirestore();
  },
  createNew: async function (inputs = {}) {
    const newUser = await (
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

    return newUser;
  },
  createOrFind: async function (
    email = '',
    stytchUserId = '',
    stytchEmailId = '',
    other = {},
  ) {
    const userEmail = email.toLowerCase();
    const existingUser = await (
      await this.db()
    )
      .collection(this.collection)
      .where('email', '==', userEmail)
      .get()
      .then((results) => {
        if (results.docs.length === 0) {
          return false;
        }
        const doc = results.docs[0];
        return { uid: doc.id, ...doc.data() };
      });

    if (existingUser !== false) {
      return existingUser;
    }

    const newUser = await (
      await this.db()
    )
      .collection(this.collection)
      .add({
        ...this.baseRecord,
        email,
        stytchUserId,
        stytchEmailId,
        ...other,
      })
      .then((docRef) => {
        return {
          uid: docRef.id,
          ...this.baseRecord,
          email,
          stytchUserId,
          stytchEmailId,
          ...other,
        };
      });

    return newUser;
  },
  findByEmail: async function (email) {
    const existingUser = await (
      await this.db()
    )
      .collection(this.collection)
      .where('email', '==', email)
      .get()
      .then((results) => {
        if (results.docs.length === 0) {
          return false;
        }
        const doc = results.docs[0];
        return { uid: doc.id, ...doc.data() };
      });
    return existingUser;
  },
  findByStytchId: async function (stytchUserId) {
    const user = await (
      await this.db()
    )
      .collection(this.collection)
      .where('stytchUserId', '==', stytchUserId)
      .get()
      .then((results) => {
        if (results.docs.length === 0) {
          return false;
        }
        const doc = results.docs[0];
        return { uid: doc.id, ...doc.data() };
      });

    return user;
  },
  findByUid: async function (uid) {
    const user = await (
      await this.db()
    )
      .collection(this.collection)
      .doc(uid)
      .get()
      .then((result) => {
        if (!result.data()) return null;
        return { uid, ...result.data() };
      });

    return user;
  },
  updateQuick: async function (userUid, updates) {
    if (!userUid) {
      return null;
    }

    await (
      await this.db()
    )
      .collection(this.collection)
      .doc(userUid)
      .update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });
    return true;
  },
};

module.exports.User = User;
