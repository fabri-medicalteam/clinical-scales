/**
 * TEST FIRESTORE CONNECTION
 *
 * Quick test to verify Firestore connection is working
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeFirestore, FirestoreHelpers } = require('../database/firestore');

async function testConnection() {
  try {
    console.log('\n🔥 Testing Firestore connection...\n');

    // Test 1: Initialize
    const db = initializeFirestore();
    console.log('✅ Step 1: Connected to Firestore');

    // Test 2: Write
    console.log('\n📝 Step 2: Testing write operation...');
    const testScale = {
      code_name: 'test_connection_scale',
      name: {
        en: 'Test Connection Scale',
        es: 'Escala de Prueba de Conexión',
        pt: 'Escala de Teste de Conexão'
      },
      description: 'Test scale for connection verification',
      variables: ['test_var'],
      get_value_function: 'def calculate():\n    return 0',
      category: ['test'],
      interpretation_dict: { en: {}, es: {}, pt: {} }
    };

    const writeResult = await FirestoreHelpers.upsertScale(testScale);
    console.log(`✅ Write successful: ${writeResult.created ? 'Created' : 'Updated'} document with ID: ${writeResult.id}`);

    // Test 3: Read
    console.log('\n📖 Step 3: Testing read operation...');
    const readScale = await FirestoreHelpers.getScale('test_connection_scale');
    console.log(`✅ Read successful: Found scale "${readScale.code_name}"`);
    console.log(`   Name (EN): ${readScale.name.en}`);

    // Test 4: Update
    console.log('\n🔄 Step 4: Testing update operation...');
    testScale.description = 'Updated description for testing';
    const updateResult = await FirestoreHelpers.upsertScale(testScale);
    console.log(`✅ Update successful: ${updateResult.updated ? 'Updated' : 'Created'} document`);

    // Test 5: List
    console.log('\n📋 Step 5: Testing list operation...');
    const { scales, lastDoc } = await FirestoreHelpers.getAllScales(5);
    console.log(`✅ List successful: Found ${scales.length} scale(s)`);
    if (scales.length > 0) {
      console.log('   Sample scales:');
      scales.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.code_name}`);
      });
    }

    // Test 6: Delete (cleanup)
    console.log('\n🗑️  Step 6: Testing delete operation (cleanup)...');
    const deleted = await FirestoreHelpers.deleteScale('test_connection_scale');
    console.log(`✅ Delete successful: ${deleted ? 'Removed' : 'Not found'} test scale`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED! Firestore is ready to use.');
    console.log('='.repeat(50) + '\n');

    console.log('Next steps:');
    console.log('1. Run migration: npm run migrate');
    console.log('2. Verify scales in Firebase Console');
    console.log('3. Test API endpoints\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ CONNECTION TEST FAILED\n');
    console.error('Error:', error.message);
    console.error('\nDetails:', error.stack);

    console.log('\nTroubleshooting:');
    console.log('1. Check .env.local has FIREBASE_SERVICE_ACCOUNT_KEY');
    console.log('2. Verify service account JSON is valid');
    console.log('3. Ensure Firestore is enabled in Firebase Console');
    console.log('4. Check Firestore rules allow read/write\n');

    process.exit(1);
  }
}

// Run test
testConnection();
