import dotenv from 'dotenv';
import { dbService, isSupabaseConfigured } from '../config/supabase.js';
import { VINTAGE_CARS, SPARE_PARTS } from '../data/db.js';

dotenv.config();

async function runSeeder() {
  console.log('🚀 Starting Supabase Database Seeder...');

  if (!isSupabaseConfigured) {
    console.error('❌ Error: Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY) are missing in backend/.env!');
    process.exit(1);
  }

  try {
    // 1. Seed Vintage Cars
    console.log('🏎️ Seeding Vintage Cars...');
    const existingCars = await dbService.getCars();
    console.log(`Found ${existingCars.length} existing vintage cars in Supabase.`);

    for (const car of VINTAGE_CARS) {
      const exists = existingCars.some(c => c.id === car.id);
      if (!exists) {
        await dbService.addCar(car);
        console.log(`  + Inserted car: ${car.name}`);
      } else {
        console.log(`  . Skipped existing car: ${car.name}`);
      }
    }

    // 2. Seed Spare Parts
    console.log('🔧 Seeding Spare Parts...');
    const existingParts = await dbService.getParts();
    console.log(`Found ${existingParts.length} existing spare parts in Supabase.`);

    for (const part of SPARE_PARTS) {
      const exists = existingParts.some(p => p.id === part.id);
      if (!exists) {
        await dbService.addPart(part);
        console.log(`  + Inserted part: ${part.title}`);
      } else {
        console.log(`  . Skipped existing part: ${part.title}`);
      }
    }

    // 3. Seed Default Test User
    console.log('👤 Checking Users in Supabase...');
    try {
      const testUser = await dbService.getUserByEmail('test@classicaircooledvwworks.com');
      if (!testUser) {
        await dbService.createUser({
          name: 'Master Restorer',
          email: 'test@classicaircooledvwworks.com',
          passwordHash: '$2a$10$w09Zk5l1M/S5V0/H8.q9Ou/dMvE7w9N5p1A4B3C2D1E0F',
          role: 'USER'
        });
        console.log('  + Inserted default test user: test@classicaircooledvwworks.com');
      } else {
        console.log('  . Found existing test user in Supabase.');
      }
    } catch (userErr) {
      console.warn('  ⚠️ Note: users table needs to be created in Supabase SQL Editor if not present yet.');
    }

    console.log('\n✅ Supabase Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding Failed with Error:', err.message);
    process.exit(1);
  }
}

runSeeder();
