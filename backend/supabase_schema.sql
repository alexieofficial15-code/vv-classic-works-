-- =========================================================
-- Aura Vintage Engineering - Supabase Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Spare Parts Table (Products / Admin Content)
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  oem_number TEXT DEFAULT '',
  car_model_id TEXT DEFAULT '',
  car_model_name TEXT DEFAULT '',
  engine_type TEXT DEFAULT '',
  category TEXT DEFAULT '',
  era TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 1,
  condition TEXT DEFAULT 'NOS (New Old Stock)',
  rarity_score TEXT DEFAULT 'Rare (85/100)',
  stock INT DEFAULT 1,
  in_stock BOOLEAN DEFAULT TRUE,
  image TEXT DEFAULT '',
  casting_code TEXT DEFAULT '',
  provenance TEXT DEFAULT '',
  specifications JSONB DEFAULT '[]'::jsonb,
  compatible_vehicles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for parts ordering and lookups
CREATE INDEX IF NOT EXISTS idx_spare_parts_created_at ON public.spare_parts(created_at DESC);

-- 3. Vintage Cars Table (Car Models / Engine Specs)
CREATE TABLE IF NOT EXISTS public.vintage_cars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  make TEXT DEFAULT '',
  model TEXT DEFAULT '',
  era TEXT DEFAULT '',
  year_range TEXT DEFAULT '',
  engine_name TEXT DEFAULT '',
  engine_type TEXT DEFAULT '',
  car_image TEXT DEFAULT '',
  engine_image TEXT DEFAULT '',
  horsepower TEXT DEFAULT '',
  torque TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT '',
  user_email TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC DEFAULT 0,
  shipping_address TEXT DEFAULT '',
  status TEXT DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user orders lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 5. Part Requests / Reservations Table
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT '',
  user_email TEXT DEFAULT '',
  user_phone TEXT DEFAULT '',
  user_city TEXT DEFAULT '',
  part_id TEXT DEFAULT '',
  part_title TEXT DEFAULT '',
  part_image TEXT DEFAULT '',
  sku TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  compatibility TEXT DEFAULT '',
  type TEXT DEFAULT 'REQUEST',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for request lookups
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);

-- 6. Live Chat Messages Table (Customer & Specialist Live Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  user_email TEXT DEFAULT '',
  sender_role TEXT NOT NULL DEFAULT 'USER',
  sender_name TEXT DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ultra-fast chat lookups & thread retrieval
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(user_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages(user_email);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(user_id, is_read) WHERE is_read = false;

-- Indexes for instant spare parts catalog filtering
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON public.spare_parts(category);
CREATE INDEX IF NOT EXISTS idx_spare_parts_car_model ON public.spare_parts(car_model_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_price ON public.spare_parts(price);

-- Enable Row Level Security (RLS) & Add Public Access Policies
-- This ensures Supabase never rejects API queries when using Anon Key or Service Role Key
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for users" ON public.users;
CREATE POLICY "Allow all actions for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for spare_parts" ON public.spare_parts;
CREATE POLICY "Allow all actions for spare_parts" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.vintage_cars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for vintage_cars" ON public.vintage_cars;
CREATE POLICY "Allow all actions for vintage_cars" ON public.vintage_cars FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for orders" ON public.orders;
CREATE POLICY "Allow all actions for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for requests" ON public.requests;
CREATE POLICY "Allow all actions for requests" ON public.requests FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for messages" ON public.messages;
CREATE POLICY "Allow all actions for messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- Grant full table permissions to anon and authenticated roles
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.spare_parts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.vintage_cars TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.requests TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role;

