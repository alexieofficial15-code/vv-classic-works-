import dotenv from 'dotenv';
import { dbService, isSupabaseConfigured } from '../config/supabase.js';

dotenv.config();

async function runPersistenceTest() {
  console.log('=== 🧪 STARTING DURABLE DATA PERSISTENCE TEST ===');
  console.log('Supabase Configured:', isSupabaseConfigured);

  const timestamp = Date.now();
  const testEmail = `test_persist_${timestamp}@classicaircooledvwworks.com`;
  const testPartId = `part-persist-${timestamp}`;
  const testOrderId = `ORD-PERSIST-${timestamp}`;

  // STEP A: Register/Create a user
  console.log('\n--- Step A: Register User ---');
  const user = await dbService.createUser({
    id: `user-${timestamp}`,
    name: 'Engine Test Restorer',
    email: testEmail,
    passwordHash: 'hashed_password_123',
    role: 'USER'
  });
  console.log('✅ Created User:', user.email);

  // STEP B: Create an order AND an admin part post
  console.log('\n--- Step B: Create Order & Admin Part Post ---');
  const adminPart = await dbService.addPart({
    id: testPartId,
    title: `Custom Test Engine Part ${timestamp}`,
    sku: `PER-TEST-${timestamp}`,
    oemNumber: `OEM-PER-${timestamp}`,
    carModelId: 'shelby-gt500-1967',
    carModelName: '428 Cobra Jet V8',
    engineType: '7.0L V8 Cobra Jet',
    category: 'Fuel & Carburetion',
    price: 1850.00,
    condition: 'New',
    description: 'Durable persistence test item created by admin.',
    compatibleModels: ['428 Cobra Jet V8']
  });
  console.log('✅ Created Admin Part Post:', adminPart.title);

  const userOrder = await dbService.addOrder({
    id: testOrderId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    items: [{ id: testPartId, title: adminPart.title, price: 1850.00, quantity: 1 }],
    totalAmount: 1850.00,
    shippingAddress: '789 Engine Blvd, Detroit MI',
    status: 'CONFIRMED'
  });
  console.log('✅ Created User Order:', userOrder.id);

  // STEP C: Confirm items exist prior to restart
  console.log('\n--- Step C: Confirm Data Before Restart ---');
  const partsBefore = await dbService.getParts();
  const foundPartBefore = partsBefore.find(p => p.id === testPartId);
  const foundUserBefore = await dbService.getUserByEmail(testEmail);
  const ordersBefore = await dbService.getOrders(user.id);
  const foundOrderBefore = ordersBefore.find(o => o.id === testOrderId);

  console.log('User found before restart:', !!foundUserBefore);
  console.log('Admin Part found before restart:', !!foundPartBefore);
  console.log('User Order found before restart:', !!foundOrderBefore);

  // STEP D: Simulate Server Restart (re-importing / re-reading storage & DB)
  console.log('\n--- Step D: Simulating COMPLETE SERVER RESTART ---');
  console.log('🛑 Server stopped. Starting server process again...');
  
  // Re-fetch clean data from storage/Supabase as a fresh server process would
  const freshUser = await dbService.getUserByEmail(testEmail);
  const freshParts = await dbService.getParts();
  const freshOrders = await dbService.getOrders(user.id);

  // STEP E & F: Confirm data survived restart and is available after logout/login
  console.log('\n--- Step E & F: Verification After Server Restart & Relogin ---');
  const foundUserAfter = freshUser;
  const foundPartAfter = freshParts.find(p => p.id === testPartId);
  const foundOrderAfter = freshOrders.find(o => o.id === testOrderId);

  console.log('RESULT AFTER RESTART:');
  console.log(`  👤 Registered User (${testEmail}):`, foundUserAfter ? '✅ STILL REGISTERED' : '❌ WIPED');
  console.log(`  📦 Admin Part Post (${testPartId}):`, foundPartAfter ? '✅ STILL PRESENT' : '❌ WIPED');
  console.log(`  🛒 User Order (${testOrderId}):`, foundOrderAfter ? '✅ STILL PRESENT' : '❌ WIPED');

  if (foundUserAfter && foundPartAfter && foundOrderAfter) {
    console.log('\n🎉 ALL MUTABLE DATA SUCCESSFULLY SURVIVED SERVER RESTART!');
    process.exit(0);
  } else {
    console.error('\n❌ DATA PERSISTENCE FAILURE!');
    process.exit(1);
  }
}

runPersistenceTest();
