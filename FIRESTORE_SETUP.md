# 🔥 FIRESTORE SETUP GUIDE

Complete guide to set up and use Firestore with Clinical Scales.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Local Development Setup](#local-development-setup)
4. [Vercel Production Setup](#vercel-production-setup)
5. [Migration from .py Files](#migration)
6. [API Usage](#api-usage)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

- Firebase account (free tier works)
- Node.js 14+ installed
- Existing clinical-scales project

---

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it: `clinical-scales` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Firestore Database

1. In Firebase Console, go to **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll configure rules later)
4. Select location: Choose closest to your users (e.g., `us-central1`, `southamerica-east1`)
5. Click **"Enable"**

### Step 3: Create Service Account

1. Go to **"Project settings"** (gear icon)
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** → JSON file downloads
5. **IMPORTANT:** Keep this file secure! It has admin access.

### Step 4: Configure Firestore Rules

In Firestore Console → **Rules** tab, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Scales collection - read public, write authenticated
    match /scales/{scaleId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Authenticated write
    }

    // Variables collection - read public, write authenticated
    match /variables/{variableId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Sessions collection - authenticated only
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **"Publish"**

---

## 💻 Local Development Setup

### Step 1: Install Dependencies

```bash
cd clinical-scales
npm install firebase-admin
```

### Step 2: Configure Environment Variables

Create `.env.local` file in project root:

```bash
# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Existing variables
ANTHROPIC_API_KEY=your-claude-api-key
GITHUB_TOKEN=your-github-token
```

**Getting the service account JSON:**
1. Open the JSON file you downloaded in Step 3
2. Copy the **entire content**
3. Paste it as a **single-line string** in `.env.local`
4. Escape quotes if needed

**Example:**
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"clinical-scales-abc123","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"firebase-adminsdk@clinical-scales-abc123.iam.gserviceaccount.com",...}'
```

### Step 3: Test Connection

Create `scripts/test_firestore.js`:

```javascript
const { initializeFirestore, FirestoreHelpers } = require('../database/firestore');

async function testConnection() {
  try {
    console.log('Testing Firestore connection...');

    const db = initializeFirestore();
    console.log('✅ Connected to Firestore');

    // Test write
    await FirestoreHelpers.upsertScale({
      code_name: 'test_scale',
      name: { en: 'Test Scale', es: 'Escala de Prueba', pt: 'Escala de Teste' },
      description: 'Test scale for connection verification',
      variables: [],
      category: ['test']
    });
    console.log('✅ Write test successful');

    // Test read
    const scale = await FirestoreHelpers.getScale('test_scale');
    console.log('✅ Read test successful:', scale.code_name);

    // Cleanup
    await FirestoreHelpers.deleteScale('test_scale');
    console.log('✅ Delete test successful');

    console.log('\n🎉 All tests passed! Firestore is ready.\n');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
```

Run:
```bash
node scripts/test_firestore.js
```

You should see:
```
✅ Connected to Firestore
✅ Write test successful
✅ Read test successful
✅ Delete test successful
🎉 All tests passed! Firestore is ready.
```

---

## ☁️ Vercel Production Setup

### Step 1: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **clinical-scales**
3. Go to **Settings → Environment Variables**
4. Add these variables:

| Name | Value | Environments |
|------|-------|--------------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | `{"type":"service_account",...}` | ✅ Production, ✅ Preview, ✅ Development |
| `FIREBASE_DATABASE_URL` | `https://your-project-id.firebaseio.com` | ✅ All |
| `GITHUB_TOKEN` | `ghp_...` | ✅ All (already set) |
| `ANTHROPIC_API_KEY` | `sk-...` | ✅ All (already set) |

**IMPORTANT:** For `FIREBASE_SERVICE_ACCOUNT_KEY`:
- Copy the **entire JSON content** from your service account file
- Paste as a **single-line string**
- Vercel will handle it correctly

### Step 2: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click `...` menu on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete (~3-5 min)

---

## 📦 Migration from .py Files

Migrate existing Python files to Firestore database.

### Step 1: Review Migration Script

```bash
cat scripts/migrate_to_firestore.js
```

This script:
- ✅ Reads all `.py` files from `scales/` directory
- ✅ Parses `SCALE_DATA` dict
- ✅ Extracts `calculate()` function
- ✅ Converts to database schema
- ✅ Creates Scale and Variable entities
- ✅ Uploads to Firestore

### Step 2: Run Migration

```bash
node scripts/migrate_to_firestore.js
```

Expected output:
```
╔══════════════════════════════════════════════════════╗
║  CLINICAL SCALES - FIRESTORE MIGRATION              ║
║  Migrates .py files to Firestore database           ║
╚══════════════════════════════════════════════════════╝

🔥 Starting migration to Firestore...

📁 Found 6 Python files to migrate

📝 Processing: cha2ds2_vasc.py
   ✅ Scale saved: cha2ds2_vasc (created)
      └─ Variable: chf (created)
      └─ Variable: hypertension (created)
      └─ Variable: age_category (created)

📝 Processing: curb_65.py
   ✅ Scale saved: curb_65 (created)
      └─ Variable: confusion (created)
      └─ Variable: bun (created)

...

📊 Migration Summary:
   ✅ Success: 6
   ❌ Errors: 0
   📁 Total: 6

🔍 Verifying migration...

✅ Found 6 scales in Firestore

📋 Sample scales:
   1. cha2ds2_vasc - CHA₂DS₂-VASc Score
   2. curb_65 - CURB-65 Score
   3. wells_dvt - Wells Score for DVT

✅ Migration complete!
```

### Step 3: Verify in Firebase Console

1. Go to Firebase Console → **Firestore Database**
2. You should see collections:
   - `scales` (6 documents)
   - `variables` (multiple documents)
3. Click on a scale document to see all fields

---

## 🔌 API Usage

### 1. Save Scale to Firestore

**Endpoint:** `POST /api/firestore/save-to-database`

**Body:**
```json
{
  "scaleData": {
    "scale_name": "APACHE II Score",
    "description": "Acute Physiology and Chronic Health Evaluation",
    "formula": "SUM_OF_POINTS",
    "interpretation": [...],
    "suggested_triggers": [...]
  },
  "variables": [
    {
      "name": "temperature",
      "description": "Body temperature",
      "type": "numerical",
      "unit": "celsius"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scale created in database",
  "scale": {
    "id": "abc123",
    "code_name": "apache_ii_score",
    "created": true
  },
  "variables": [...]
}
```

### 2. Get Scales from Firestore

**Endpoint:** `GET /api/firestore/get-scales?code_names=cha2ds2_vasc,curb_65`

or

`POST /api/firestore/get-scales`
```json
{
  "code_names": ["cha2ds2_vasc", "curb_65"]
}
```

**Response:**
```json
{
  "success": true,
  "scales": [
    {
      "id": "xyz",
      "code_name": "cha2ds2_vasc",
      "name": {
        "en": "CHA₂DS₂-VASc Score",
        "es": "Puntuación CHA₂DS₂-VASc",
        "pt": "Escore CHA₂DS₂-VASc"
      },
      "variables": ["chf", "hypertension", ...],
      "get_value_function": "def calculate(...):\n    ...",
      ...
    }
  ],
  "variables": {
    "chf": {
      "name": "chf",
      "medical_name": {...},
      "type": "categorical",
      ...
    }
  }
}
```

### 3. List All Scales

**Endpoint:** `GET /api/firestore/list-scales?limit=50&language=en`

**Response:**
```json
{
  "success": true,
  "scales": [
    {
      "code_name": "cha2ds2_vasc",
      "name": "CHA₂DS₂-VASc Score",
      "description": "Stroke risk in atrial fibrillation",
      "category": ["cardiology", "stroke_risk"],
      "variables_count": 7
    }
  ],
  "metadata": {
    "count": 6,
    "available_categories": ["cardiology", "pulmonology", "nephrology"]
  }
}
```

### 4. Search Scales

**Endpoint:** `GET /api/firestore/list-scales?search=stroke&language=en`

### 5. Filter by Category

**Endpoint:** `GET /api/firestore/list-scales?category=cardiology&limit=20`

---

## 🔧 Troubleshooting

### Error: "Could not load the default credentials"

**Solution:**
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
- Verify JSON is valid (use jsonlint.com)
- Ensure it's a single-line string

### Error: "Permission denied"

**Solution:**
- Check Firestore Rules (see Step 4 of Firebase Setup)
- Make sure `allow read: if true;` for public collections
- For writes, ensure authentication is configured

### Error: "Project ID not found"

**Solution:**
- Verify `FIREBASE_DATABASE_URL` is correct
- Check service account JSON has correct `project_id`

### Migration shows "0 files found"

**Solution:**
- Check that `scales/` directory exists
- Verify .py files are present
- Run from project root: `node scripts/migrate_to_firestore.js`

### Vercel deployment fails

**Solution:**
- Check all environment variables are set
- View deployment logs for specific error
- Ensure `firebase-admin` is in `package.json` dependencies

---

## 📚 Next Steps

1. ✅ **Migration Complete** → Test API endpoints
2. ✅ **API Working** → Integrate with frontend
3. ✅ **Frontend Updated** → Test in production
4. ✅ **Production Tested** → Implement Python backend for `getScales` pipeline

---

## 🎓 Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

---

## 📧 Support

Having issues? Check:
1. Firebase Console → Firestore → Data (verify collections exist)
2. Vercel Dashboard → Deployments → Logs (check for errors)
3. Local: `node scripts/test_firestore.js` (verify connection)

---

**Ready to go!** 🚀 Your Firestore database is now set up and ready to use with Clinical Scales.
