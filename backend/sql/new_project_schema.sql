-- ============================================================================
-- Classic Aircooled VW Works - full schema for a NEW Supabase project
-- Generated from the live database (pg_dump), cleaned up so it can be pasted
-- straight into  Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- Safe to run more than once (IF NOT EXISTS everywhere).
-- Creates EMPTY tables. Import the data afterwards (users first, because
-- requests.user_id references users.id).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
    id            text PRIMARY KEY,
    name          text NOT NULL,
    email         text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role          text DEFAULT 'USER',
    phone         text,
    city          text,
    created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.spare_parts (
    id                  text PRIMARY KEY,
    title               text NOT NULL,
    oem_number          text,
    car_model_id        text,
    car_model_name      text,
    engine_type         text,
    category            text NOT NULL,
    era                 text,
    price               numeric(10,2) NOT NULL DEFAULT 0.00,
    rating              numeric(3,2) DEFAULT 5.0,
    reviews_count       integer DEFAULT 1,
    condition           text DEFAULT 'NOS (New Old Stock)',
    rarity_score        text DEFAULT 'Rare (85/100)',
    stock               integer DEFAULT 1,
    in_stock            boolean DEFAULT true,
    image               text,
    casting_code        text,
    provenance          text,
    specifications      jsonb DEFAULT '[]'::jsonb,
    compatible_vehicles jsonb DEFAULT '[]'::jsonb,
    created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vintage_cars (
    id           text PRIMARY KEY,
    name         text NOT NULL,
    make         text,
    model        text,
    era          text,
    year_range   text,
    engine_name  text,
    engine_type  text,
    car_image    text,
    engine_image text,
    horsepower   text,
    torque       text,
    description  text,
    created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id               text PRIMARY KEY,
    user_id          text,
    user_name        text,
    user_email       text,
    items            jsonb NOT NULL,
    total_amount     numeric(10,2) NOT NULL,
    shipping_address text,
    status           text DEFAULT 'CONFIRMED',
    created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requests (
    id            text PRIMARY KEY,
    user_id       text REFERENCES public.users(id) ON DELETE SET NULL,
    user_name     text DEFAULT '',
    user_email    text DEFAULT '',
    user_phone    text DEFAULT '',
    user_city     text DEFAULT '',
    part_id       text DEFAULT '',
    part_title    text DEFAULT '',
    part_image    text DEFAULT '',
    sku           text DEFAULT '',
    price         numeric DEFAULT 0,
    compatibility text DEFAULT '',
    type          text DEFAULT 'REQUEST',
    status        text DEFAULT 'Pending',
    created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id          text PRIMARY KEY,
    user_id     text NOT NULL,
    user_name   text DEFAULT '',
    user_email  text DEFAULT '',
    sender_role text NOT NULL DEFAULT 'USER',
    sender_name text DEFAULT '',
    message     text NOT NULL,
    is_read     boolean DEFAULT false,
    created_at  timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_users_email             ON public.users        (email);

CREATE INDEX IF NOT EXISTS idx_spare_parts_car_model   ON public.spare_parts  (car_model_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_category    ON public.spare_parts  (category);
CREATE INDEX IF NOT EXISTS idx_spare_parts_created_at  ON public.spare_parts  (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spare_parts_price       ON public.spare_parts  (price);

CREATE INDEX IF NOT EXISTS idx_orders_created_at       ON public.orders       (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id          ON public.orders       (user_id);

CREATE INDEX IF NOT EXISTS idx_requests_created_at     ON public.requests     (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_user_id        ON public.requests     (user_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at     ON public.messages     (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_email          ON public.messages     (user_email);
CREATE INDEX IF NOT EXISTS idx_messages_thread         ON public.messages     (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread         ON public.messages     (user_id, is_read) WHERE (is_read = false);
CREATE INDEX IF NOT EXISTS idx_messages_user_id        ON public.messages     (user_id);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Turned ON with NO policies: the public "anon" key can read/write nothing.
-- Your backend must use the SERVICE ROLE key (SUPABASE_SERVICE_ROLE_KEY),
-- which bypasses RLS. (The old project had "allow everyone" policies, which
-- let anyone holding the anon key read the users table, password hashes
-- included.)
-- ---------------------------------------------------------------------------

ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vintage_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages     ENABLE ROW LEVEL SECURITY;

-- Only if you must run the backend with the ANON key instead (NOT recommended),
-- uncomment this block. It recreates the old wide-open behaviour.
--
-- CREATE POLICY "Allow all actions for users"        ON public.users        USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all actions for spare_parts"  ON public.spare_parts  USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all actions for vintage_cars" ON public.vintage_cars USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all actions for orders"       ON public.orders       USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all actions for requests"     ON public.requests     USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all actions for messages"     ON public.messages     USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Quick check: all six tables should be listed with 0 rows
-- ---------------------------------------------------------------------------
SELECT 'users' AS table_name, count(*) FROM public.users
UNION ALL SELECT 'spare_parts',  count(*) FROM public.spare_parts
UNION ALL SELECT 'vintage_cars', count(*) FROM public.vintage_cars
UNION ALL SELECT 'orders',       count(*) FROM public.orders
UNION ALL SELECT 'requests',     count(*) FROM public.requests
UNION ALL SELECT 'messages',     count(*) FROM public.messages;
