-- =============================================================================
-- Apple AirPods Max E-Commerce - Complete Database Schema v2.0
-- =============================================================================
-- This file contains the complete schema for the application.
-- Run this against a fresh Supabase project to set up the entire database.
--
-- Tables: products, accessories, profiles, addresses, orders, order_items,
--         coupons, admin_users
--
-- ⚠️  WARNING: The RESET section below will DELETE all existing data!
--     Comment out the reset section if you only want to create new tables.
-- =============================================================================


-- =============================================================================
-- ☢️  FULL RESET (Drop everything to start from zero)
-- =============================================================================
-- Comment out this entire section if you DON'T want to wipe existing data.

-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS trg_products_updated_at    ON products;
DROP TRIGGER IF EXISTS trg_accessories_updated_at ON accessories;
DROP TRIGGER IF EXISTS trg_profiles_updated_at    ON profiles;
DROP TRIGGER IF EXISTS trg_addresses_updated_at   ON addresses;
DROP TRIGGER IF EXISTS trg_orders_updated_at      ON orders;
DROP TRIGGER IF EXISTS trg_coupons_updated_at     ON coupons;
DROP TRIGGER IF EXISTS trg_admin_updated_at       ON admin_users;
DROP TRIGGER IF EXISTS trg_generate_order_number  ON orders;
DROP TRIGGER IF EXISTS on_auth_user_created        ON auth.users;
DROP TRIGGER IF EXISTS trg_enforce_single_default  ON addresses;
DROP TRIGGER IF EXISTS trg_max_addresses           ON addresses;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column()      CASCADE;
DROP FUNCTION IF EXISTS generate_order_number()         CASCADE;
DROP FUNCTION IF EXISTS handle_new_user()               CASCADE;
DROP FUNCTION IF EXISTS enforce_single_default_address() CASCADE;
DROP FUNCTION IF EXISTS enforce_max_addresses()          CASCADE;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS order_items  CASCADE;
DROP TABLE IF EXISTS orders       CASCADE;
DROP TABLE IF EXISTS addresses    CASCADE;
DROP TABLE IF EXISTS profiles     CASCADE;
DROP TABLE IF EXISTS accessories  CASCADE;
DROP TABLE IF EXISTS products     CASCADE;
DROP TABLE IF EXISTS coupons      CASCADE;
DROP TABLE IF EXISTS admin_users  CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS order_number_seq;


-- =============================================================================
-- SETUP
-- =============================================================================

-- ▸ Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PRODUCTS TABLE
-- =============================================================================
-- AirPods Max color variants available for purchase

CREATE TABLE IF NOT EXISTS products (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    value       TEXT NOT NULL,                          -- Hex color code (e.g. #5e5e63)
    price       NUMERIC NOT NULL DEFAULT 549.00,
    image_url   TEXT NOT NULL,
    filter_style TEXT DEFAULT 'none',                   -- CSS filter string for product image
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE products IS 'AirPods Max color variants available for purchase';
COMMENT ON COLUMN products.value IS 'Hex color code for the product finish';
COMMENT ON COLUMN products.filter_style IS 'CSS filter string applied to product image';


-- =============================================================================
-- 2. ACCESSORIES TABLE
-- =============================================================================
-- Add-on items available during checkout

CREATE TABLE IF NOT EXISTS accessories (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,                   -- URL-safe identifier (e.g. 'applecare')
    name        TEXT NOT NULL,
    description TEXT,
    price       NUMERIC NOT NULL,
    image_url   TEXT,
    is_applecare BOOLEAN DEFAULT FALSE,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE accessories IS 'Add-on items available during checkout';


-- =============================================================================
-- 3. PROFILES TABLE
-- =============================================================================
-- Extended user profile information, 1:1 with auth.users

CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT CHECK (char_length(full_name) >= 2),
    avatar_url  TEXT,
    phone       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Extended user profile information, 1:1 with auth.users';


-- =============================================================================
-- 4. ADDRESSES TABLE
-- =============================================================================
-- User delivery addresses, max 10 per user

CREATE TABLE IF NOT EXISTS addresses (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label           TEXT DEFAULT 'Home',               -- e.g. 'Home', 'Office', 'Other'
    full_name       TEXT NOT NULL,
    phone_number    TEXT,
    address_line1   TEXT NOT NULL,
    address_line2   TEXT,
    city            TEXT NOT NULL,
    state           TEXT NOT NULL,
    zip_code        TEXT NOT NULL,
    country         TEXT NOT NULL DEFAULT 'USA',
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE addresses IS 'User delivery addresses, max 10 per user';


-- =============================================================================
-- 5. ORDERS TABLE
-- =============================================================================
-- Customer orders with shipping snapshot and financial details
-- order_number is auto-generated via trigger (e.g. ORD-2026-00001)

CREATE TABLE IF NOT EXISTS orders (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number    TEXT UNIQUE,                        -- Auto-generated: ORD-YYYY-NNNNN
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Shipping snapshot (preserved even if address changes later)
    shipping_name       TEXT NOT NULL,
    shipping_address    TEXT NOT NULL,
    shipping_city       TEXT NOT NULL,
    shipping_state      TEXT,
    shipping_zip        TEXT NOT NULL,
    shipping_country    TEXT NOT NULL DEFAULT 'USA',
    shipping_phone      TEXT,

    -- Financials
    subtotal        NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    shipping_cost   NUMERIC DEFAULT 0,
    total           NUMERIC NOT NULL,

    -- Coupon tracking
    coupon_code     TEXT,

    -- Status
    status          TEXT NOT NULL DEFAULT 'Processing'
                    CHECK (status IN ('Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
    payment_method  TEXT DEFAULT 'card',
    payment_status  TEXT NOT NULL DEFAULT 'paid'
                    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Customer orders with shipping snapshot and financial details';


-- =============================================================================
-- 6. ORDER ITEMS TABLE
-- =============================================================================
-- Individual line items within an order (products + accessories)

CREATE TABLE IF NOT EXISTS order_items (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_type       TEXT NOT NULL CHECK (item_type IN ('product', 'accessory')),
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    accessory_id    UUID REFERENCES accessories(id) ON DELETE SET NULL,
    item_name       TEXT NOT NULL,                     -- Snapshot of the item name at order time
    item_price      NUMERIC NOT NULL,                  -- Snapshot of price at order time
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total      NUMERIC NOT NULL,                  -- item_price * quantity
    color_name      TEXT,                              -- For product items only
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE order_items IS 'Individual line items within an order (products + accessories)';


-- =============================================================================
-- 7. COUPONS TABLE
-- =============================================================================
-- Discount codes with usage tracking and expiry

CREATE TABLE IF NOT EXISTS coupons (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value  NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC DEFAULT 0,
    max_uses        INTEGER,                           -- NULL = unlimited
    usage_count     INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    expiry_date     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE coupons IS 'Discount codes with usage tracking and expiry';


-- =============================================================================
-- 8. ADMIN USERS TABLE
-- =============================================================================
-- Admin accounts with role-based permissions

CREATE TABLE IF NOT EXISTS admin_users (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,                          -- NOTE: Hash in production!
    role        TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('super_admin', 'admin', 'viewer')),
    permissions JSONB DEFAULT '[]'::jsonb,             -- e.g. ["dashboard","orders","products"]
    is_active   BOOLEAN DEFAULT TRUE,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_users IS 'Store admin accounts with role-based permissions';


-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- ▸ Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_updated_at    BEFORE UPDATE ON products     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_accessories_updated_at BEFORE UPDATE ON accessories  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_profiles_updated_at    BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_addresses_updated_at   BEFORE UPDATE ON addresses    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at      BEFORE UPDATE ON orders       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_coupons_updated_at     BEFORE UPDATE ON coupons      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_admin_updated_at       BEFORE UPDATE ON admin_users  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ▸ Auto-generate order numbers (ORD-2026-00001)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();


-- ▸ Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- ▸ Enforce single default address per user
CREATE OR REPLACE FUNCTION enforce_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE addresses SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_single_default
    BEFORE INSERT OR UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_default_address();


-- ▸ Enforce max 10 addresses per user
CREATE OR REPLACE FUNCTION enforce_max_addresses()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    address_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO address_count
    FROM addresses WHERE user_id = NEW.user_id;
    
    IF address_count >= 10 THEN
        RAISE EXCEPTION 'Maximum of 10 addresses allowed per user';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_max_addresses
    BEFORE INSERT ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION enforce_max_addresses();


-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- ▸ Enable RLS on all tables
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users  ENABLE ROW LEVEL SECURITY;

-- ───── Products: Public read, service role write ─────
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT USING (true);
CREATE POLICY "Products managed by service role"
    ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anon can manage products"
    ON products FOR ALL USING (auth.role() = 'anon');

-- ───── Accessories: Public read, service role write ─────
CREATE POLICY "Accessories are viewable by everyone"
    ON accessories FOR SELECT USING (true);
CREATE POLICY "Accessories managed by service role"
    ON accessories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anon can manage accessories"
    ON accessories FOR ALL USING (auth.role() = 'anon');

-- ───── Profiles: Users manage their own ─────
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role full access to profiles"
    ON profiles FOR ALL USING (auth.role() = 'service_role');

-- ───── Addresses: Users manage their own ─────
CREATE POLICY "Users can view their own addresses"
    ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses"
    ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses"
    ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses"
    ON addresses FOR DELETE USING (auth.uid() = user_id);

-- ───── Orders: Users view/create their own, anon can also create ─────
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders"
    ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anon can create orders"
    ON orders FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Anon can read all orders"
    ON orders FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Anon can update orders"
    ON orders FOR UPDATE USING (auth.role() = 'anon');
CREATE POLICY "Anon can delete orders"
    ON orders FOR DELETE USING (auth.role() = 'anon');

-- ───── Order Items: Follow order access ─────
CREATE POLICY "Users can view their order items"
    ON order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    ));
CREATE POLICY "Users can create order items"
    ON order_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    ));
CREATE POLICY "Anon can manage order items"
    ON order_items FOR ALL USING (auth.role() = 'anon');

-- ───── Coupons: Public read active coupons, service role write ─────
CREATE POLICY "Active coupons are viewable by everyone"
    ON coupons FOR SELECT USING (true);
CREATE POLICY "Coupons managed by service role"
    ON coupons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anon can manage coupons"
    ON coupons FOR ALL USING (auth.role() = 'anon');

-- ───── Admin Users: Service role + anon for login ─────
CREATE POLICY "Admin users managed by service role"
    ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anon can read admin users for login"
    ON admin_users FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Anon can manage admin users"
    ON admin_users FOR ALL USING (auth.role() = 'anon');


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ▸ Products (5 AirPods Max color variants)
INSERT INTO products (name, value, price, image_url, filter_style) VALUES
    ('Space Gray', '#5e5e63', 549.00, '/products/airpods-max-select.png', 'brightness(0.4)'),
    ('Silver',     '#e3e4e5', 549.00, '/products/airpods-max-select.png', 'none'),
    ('Sky Blue',   '#a4c4d6', 549.00, '/products/airpods-max-select.png', 'sepia(1) saturate(2) hue-rotate(170deg) brightness(0.9) contrast(0.9)'),
    ('Pink',       '#eeb3b6', 549.00, '/products/airpods-max-select.png', 'sepia(1) saturate(1.5) hue-rotate(320deg) brightness(0.9) contrast(0.9)'),
    ('Green',      '#a9cbad', 549.00, '/products/airpods-max-select.png', 'sepia(1) saturate(1.5) hue-rotate(80deg) brightness(0.9) contrast(0.9)')
ON CONFLICT (name) DO NOTHING;

-- ▸ Accessories (3 add-on items)
INSERT INTO accessories (slug, name, description, price, image_url, is_applecare) VALUES
    ('applecare', 'AppleCare+ for Headphones', 'Extended warranty and accidental damage coverage', 59.00, NULL, TRUE),
    ('adapter',   '20W USB-C Power Adapter',   'Fast-charge your AirPods Max',                   19.00, '/products/20w-adapter.png', FALSE),
    ('cable',     'Lightning to 3.5 mm Audio Cable - 1.2m', 'Connect to non-wireless audio sources', 35.00, '/products/audio-cable.png', FALSE)
ON CONFLICT (slug) DO NOTHING;

-- ▸ Coupons (2 default discount codes)
INSERT INTO coupons (code, discount_type, discount_value, expiry_date) VALUES
    ('APPLE', 'percent', 10, NOW() + INTERVAL '1 year'),   -- 10% off
    ('HELLO', 'fixed',   20, NOW() + INTERVAL '1 year')    -- $20 off
ON CONFLICT (code) DO NOTHING;

-- ▸ Admin Users (1 super admin + 1 regular admin)
INSERT INTO admin_users (email, password, role, permissions) VALUES
    ('adminnitin@gmail.com', 'adminnitin', 'super_admin', '["dashboard","orders","products","customers","coupons","settings"]'::jsonb),
    ('staff@store.com',      'staff123',   'admin',       '["dashboard","orders","products"]'::jsonb)
ON CONFLICT (email) DO NOTHING;
