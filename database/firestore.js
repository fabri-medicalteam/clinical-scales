/**
 * FIRESTORE CONFIGURATION
 *
 * Firebase/Firestore setup for clinical scales database
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable with your service account JSON
let db = null;

function initializeFirestore() {
  if (db) {
    return db; // Already initialized
  }

  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Initialize with environment variable
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      } else {
        // Fallback: Use default credentials (for local development)
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      }
    }

    db = admin.firestore();

    // Configure Firestore settings
    db.settings({
      timestampsInSnapshots: true,
      ignoreUndefinedProperties: true
    });

    console.log('✅ Firestore initialized successfully');
    return db;

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    throw error;
  }
}

// Collection references
function getCollections() {
  const firestore = initializeFirestore();

  return {
    scales: firestore.collection('scales'),
    variables: firestore.collection('variables'),
    sessions: firestore.collection('sessions'),
    metadata: firestore.collection('metadata')
  };
}

// Helper functions for common operations
const FirestoreHelpers = {
  /**
   * Get scale by code_name
   */
  async getScale(code_name) {
    const { scales } = getCollections();
    const snapshot = await scales.where('code_name', '==', code_name).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  /**
   * Get multiple scales by code_names
   */
  async getScales(code_names) {
    if (!code_names || code_names.length === 0) {
      return [];
    }

    const { scales } = getCollections();

    // Firestore 'in' query limited to 10 items
    const chunks = [];
    for (let i = 0; i < code_names.length; i += 10) {
      chunks.push(code_names.slice(i, i + 10));
    }

    const results = [];
    for (const chunk of chunks) {
      const snapshot = await scales.where('code_name', 'in', chunk).get();
      snapshot.docs.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
    }

    return results;
  },

  /**
   * Get variable by name
   */
  async getVariable(name) {
    const { variables } = getCollections();
    const snapshot = await variables.where('name', '==', name).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  /**
   * Get multiple variables by names
   */
  async getVariables(names) {
    if (!names || names.length === 0) {
      return [];
    }

    const { variables } = getCollections();

    // Handle Firestore 'in' query limit
    const chunks = [];
    for (let i = 0; i < names.length; i += 10) {
      chunks.push(names.slice(i, i + 10));
    }

    const results = [];
    for (const chunk of chunks) {
      const snapshot = await variables.where('name', 'in', chunk).get();
      snapshot.docs.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
    }

    return results;
  },

  /**
   * Create or update scale
   */
  async upsertScale(scaleData) {
    const { scales } = getCollections();
    const code_name = scaleData.code_name;

    // Check if exists
    const existing = await this.getScale(code_name);

    if (existing) {
      // Update
      await scales.doc(existing.id).update({
        ...scaleData,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: existing.id, ...scaleData, updated: true };
    } else {
      // Create
      const docRef = await scales.add({
        ...scaleData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: docRef.id, ...scaleData, created: true };
    }
  },

  /**
   * Create or update variable
   */
  async upsertVariable(variableData) {
    const { variables } = getCollections();
    const name = variableData.name;

    // Check if exists
    const existing = await this.getVariable(name);

    if (existing) {
      // Update
      await variables.doc(existing.id).update({
        ...variableData,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: existing.id, ...variableData, updated: true };
    } else {
      // Create
      const docRef = await variables.add({
        ...variableData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: docRef.id, ...variableData, created: true };
    }
  },

  /**
   * Delete scale by code_name
   */
  async deleteScale(code_name) {
    const { scales } = getCollections();
    const existing = await this.getScale(code_name);

    if (existing) {
      await scales.doc(existing.id).delete();
      return true;
    }
    return false;
  },

  /**
   * Delete variable by name
   */
  async deleteVariable(name) {
    const { variables } = getCollections();
    const existing = await this.getVariable(name);

    if (existing) {
      await variables.doc(existing.id).delete();
      return true;
    }
    return false;
  },

  /**
   * Get all scales (paginated)
   */
  async getAllScales(limit = 100, startAfter = null) {
    const { scales } = getCollections();

    let query = scales.orderBy('code_name').limit(limit);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const snapshot = await query.get();
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      scales: results,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  },

  /**
   * Get scales by category
   */
  async getScalesByCategory(category, limit = 50) {
    const { scales } = getCollections();

    const snapshot = await scales
      .where('category', 'array-contains', category)
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Search scales by name (simple text search)
   */
  async searchScales(searchTerm, language = 'en', limit = 20) {
    const { scales } = getCollections();

    // Firestore doesn't have full-text search, so we get all and filter
    // For production, consider using Algolia or ElasticSearch
    const snapshot = await scales.limit(limit).get();

    const searchLower = searchTerm.toLowerCase();

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(scale => {
        const name = scale.name?.[language]?.toLowerCase() || '';
        const description = scale.description?.toLowerCase() || '';
        const codeName = scale.code_name?.toLowerCase() || '';

        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               codeName.includes(searchLower);
      });
  }
};

module.exports = {
  initializeFirestore,
  getCollections,
  FirestoreHelpers,
  admin
};
