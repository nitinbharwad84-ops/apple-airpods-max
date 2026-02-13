-- =============================================================================
-- Apple AirPods Max E-Commerce + ERP — Complete Database Schema v3.0
-- =============================================================================
-- 20+ Tables | 12 Roles | 18 Admin Modules | Secure RPC Functions
--
-- ⚠️  WARNING: The RESET section will DELETE all existing data!
-- =============================================================================


-- =============================================================================
-- ☢️  FULL RESET
-- =============================================================================

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
DROP TRIGGER IF EXISTS trg_inventory_updated_at    ON inventory;
DROP TRIGGER IF EXISTS trg_expenses_updated_at     ON expenses;
DROP TRIGGER IF EXISTS trg_suppliers_updated_at    ON suppliers;
DROP TRIGGER IF EXISTS trg_purchase_orders_updated ON purchase_orders;
DROP TRIGGER IF EXISTS trg_returns_updated_at      ON returns;
DROP TRIGGER IF EXISTS trg_shipping_updated_at     ON shipping_tracking;
DROP TRIGGER IF EXISTS trg_store_settings_updated  ON store_settings;

DROP FUNCTION IF EXISTS update_updated_at_column()      CASCADE;
DROP FUNCTION IF EXISTS generate_order_number()         CASCADE;
DROP FUNCTION IF EXISTS handle_new_user()               CASCADE;
DROP FUNCTION IF EXISTS enforce_single_default_address() CASCADE;
DROP FUNCTION IF EXISTS enforce_max_addresses()          CASCADE;
DROP FUNCTION IF EXISTS admin_login(TEXT, TEXT)          CASCADE;
DROP FUNCTION IF EXISTS admin_check_permission(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS log_admin_activity(UUID, TEXT, TEXT, TEXT, JSONB) CASCADE;

DROP TABLE IF EXISTS notifications         CASCADE;
DROP TABLE IF EXISTS admin_audit_log       CASCADE;
DROP TABLE IF EXISTS store_settings        CASCADE;
DROP TABLE IF EXISTS shipping_tracking     CASCADE;
DROP TABLE IF EXISTS returns               CASCADE;
DROP TABLE IF EXISTS purchase_order_items  CASCADE;
DROP TABLE IF EXISTS purchase_orders       CASCADE;
DROP TABLE IF EXISTS suppliers             CASCADE;
DROP TABLE IF EXISTS expenses              CASCADE;
DROP TABLE IF EXISTS expense_categories    CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory             CASCADE;
DROP TABLE IF EXISTS order_items           CASCADE;
DROP TABLE IF EXISTS orders                CASCADE;
DROP TABLE IF EXISTS addresses             CASCADE;
DROP TABLE IF EXISTS profiles              CASCADE;
DROP TABLE IF EXISTS coupons               CASCADE;
DROP TABLE IF EXISTS accessories           CASCADE;
DROP TABLE IF EXISTS products              CASCADE;
DROP TABLE IF EXISTS admin_users           CASCADE;
DROP TABLE IF EXISTS admin_roles           CASCADE;

DROP SEQUENCE IF EXISTS order_number_seq;
DROP SEQUENCE IF EXISTS po_number_seq;
DROP SEQUENCE IF EXISTS return_number_seq;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- SECTION 1: ADMIN & AUTH
-- =============================================================================

-- 1A. Admin Roles
CREATE TABLE admin_roles (
    id          TEXT PRIMARY KEY,                       -- e.g. 'super_admin'
    label       TEXT NOT NULL,                          -- e.g. 'Super Admin'
    description TEXT,
    modules     JSONB NOT NULL DEFAULT '[]'::jsonb,     -- allowed module slugs
    is_system   BOOLEAN DEFAULT FALSE,                  -- system roles can't be deleted
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_roles IS 'Role definitions with allowed ERP modules';

-- 1B. Admin Users
CREATE TABLE admin_users (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role_id     TEXT NOT NULL REFERENCES admin_roles(id) ON DELETE RESTRICT,
    full_name   TEXT,
    phone       TEXT,
    avatar_url  TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    last_login  TIMESTAMPTZ,
    created_by  UUID,                                   -- which admin created this user
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_users IS 'Admin accounts linked to roles (secured, no public access)';


-- =============================================================================
-- SECTION 2: CORE E-COMMERCE
-- =============================================================================

-- 2A. Products
CREATE TABLE products (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    value       TEXT NOT NULL,
    price       NUMERIC NOT NULL DEFAULT 549.00,
    image_url   TEXT NOT NULL,
    filter_style TEXT DEFAULT 'none',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2B. Accessories
CREATE TABLE accessories (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    description TEXT,
    price       NUMERIC NOT NULL,
    image_url   TEXT,
    is_applecare BOOLEAN DEFAULT FALSE,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2C. Profiles
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT CHECK (char_length(full_name) >= 2),
    avatar_url  TEXT,
    phone       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2D. Addresses
CREATE TABLE addresses (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label           TEXT DEFAULT 'Home',
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

-- 2E. Orders
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE orders (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number    TEXT UNIQUE,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shipping_name       TEXT NOT NULL,
    shipping_address    TEXT NOT NULL,
    shipping_city       TEXT NOT NULL,
    shipping_state      TEXT,
    shipping_zip        TEXT NOT NULL,
    shipping_country    TEXT NOT NULL DEFAULT 'USA',
    shipping_phone      TEXT,
    subtotal        NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    shipping_cost   NUMERIC DEFAULT 0,
    tax_amount      NUMERIC DEFAULT 0,
    total           NUMERIC NOT NULL,
    coupon_code     TEXT,
    status          TEXT NOT NULL DEFAULT 'Processing'
                    CHECK (status IN ('Processing','Confirmed','Shipped','Delivered','Cancelled','Refunded')),
    payment_method  TEXT DEFAULT 'card',
    payment_status  TEXT NOT NULL DEFAULT 'paid'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2F. Order Items
CREATE TABLE order_items (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_type       TEXT NOT NULL CHECK (item_type IN ('product','accessory')),
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    accessory_id    UUID REFERENCES accessories(id) ON DELETE SET NULL,
    item_name       TEXT NOT NULL,
    item_price      NUMERIC NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total      NUMERIC NOT NULL,
    color_name      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2G. Coupons
CREATE TABLE coupons (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
    discount_value  NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC DEFAULT 0,
    max_uses        INTEGER,
    usage_count     INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    expiry_date     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- SECTION 3: INVENTORY & STOCK
-- =============================================================================

CREATE TABLE inventory (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    accessory_id    UUID REFERENCES accessories(id) ON DELETE CASCADE,
    item_name       TEXT NOT NULL,
    sku             TEXT UNIQUE,
    current_stock   INTEGER NOT NULL DEFAULT 0,
    reserved_stock  INTEGER NOT NULL DEFAULT 0,          -- reserved by pending orders
    reorder_point   INTEGER NOT NULL DEFAULT 10,         -- alert when stock falls below
    reorder_qty     INTEGER NOT NULL DEFAULT 50,         -- how many to reorder
    unit_cost       NUMERIC DEFAULT 0,                   -- cost price per unit
    location        TEXT DEFAULT 'Main Warehouse',
    is_tracked      BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CHECK (product_id IS NOT NULL OR accessory_id IS NOT NULL)
);

CREATE TABLE inventory_transactions (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventory_id    UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL
                    CHECK (transaction_type IN ('purchase_in','sale_out','adjustment','return_in','damaged','transfer')),
    quantity        INTEGER NOT NULL,                    -- positive=in, negative=out
    reference_type  TEXT,                                -- 'order','purchase_order','manual','return'
    reference_id    UUID,                                -- links to order/PO/return id
    notes           TEXT,
    performed_by    UUID REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE inventory IS 'Stock levels per product/accessory with reorder alerts';
COMMENT ON TABLE inventory_transactions IS 'Stock movement log (in/out/adjustments)';


-- =============================================================================
-- SECTION 4: SUPPLIERS & PURCHASE ORDERS
-- =============================================================================

CREATE TABLE suppliers (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            TEXT NOT NULL,
    contact_name    TEXT,
    email           TEXT,
    phone           TEXT,
    address         TEXT,
    city            TEXT,
    country         TEXT DEFAULT 'USA',
    payment_terms   TEXT DEFAULT 'Net 30',
    is_active       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1;

CREATE TABLE purchase_orders (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    po_number       TEXT UNIQUE,
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    status          TEXT NOT NULL DEFAULT 'Draft'
                    CHECK (status IN ('Draft','Sent','Confirmed','Partially Received','Received','Cancelled')),
    subtotal        NUMERIC DEFAULT 0,
    tax_amount      NUMERIC DEFAULT 0,
    shipping_cost   NUMERIC DEFAULT 0,
    total           NUMERIC DEFAULT 0,
    expected_date   DATE,
    received_date   DATE,
    notes           TEXT,
    created_by      UUID REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_id    UUID NOT NULL REFERENCES inventory(id),
    item_name       TEXT NOT NULL,
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER DEFAULT 0,
    unit_cost       NUMERIC NOT NULL,
    line_total      NUMERIC NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- SECTION 5: FINANCES
-- =============================================================================

CREATE TABLE expense_categories (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    color       TEXT DEFAULT '#6B7280',                 -- for UI display
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id     UUID REFERENCES expense_categories(id),
    title           TEXT NOT NULL,
    description     TEXT,
    amount          NUMERIC NOT NULL CHECK (amount > 0),
    expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring    BOOLEAN DEFAULT FALSE,
    recurrence      TEXT CHECK (recurrence IN ('weekly','monthly','quarterly','yearly')),
    payment_method  TEXT,
    receipt_url     TEXT,
    created_by      UUID REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- SECTION 6: SHIPPING & RETURNS
-- =============================================================================

CREATE TABLE shipping_tracking (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carrier         TEXT NOT NULL DEFAULT 'Apple Shipping',
    tracking_number TEXT,
    status          TEXT NOT NULL DEFAULT 'Label Created'
                    CHECK (status IN ('Label Created','Picked Up','In Transit','Out for Delivery','Delivered','Failed','Returned')),
    estimated_delivery DATE,
    actual_delivery    DATE,
    tracking_url    TEXT,
    notes           TEXT,
    updated_by      UUID REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS return_number_seq START 1;

CREATE TABLE returns (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    return_number   TEXT UNIQUE,
    order_id        UUID NOT NULL REFERENCES orders(id),
    user_id         UUID REFERENCES auth.users(id),
    reason          TEXT NOT NULL
                    CHECK (reason IN ('defective','wrong_item','not_as_described','changed_mind','damaged_in_shipping','other')),
    reason_details  TEXT,
    status          TEXT NOT NULL DEFAULT 'Requested'
                    CHECK (status IN ('Requested','Approved','Rejected','Received','Refunded','Closed')),
    refund_amount   NUMERIC DEFAULT 0,
    refund_method   TEXT DEFAULT 'original_payment',
    processed_by    UUID REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- SECTION 7: SYSTEM & AUDIT
-- =============================================================================

CREATE TABLE admin_audit_log (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id        UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email     TEXT,
    action          TEXT NOT NULL,                      -- 'login','create','update','delete'
    module          TEXT NOT NULL,                      -- 'orders','products', etc.
    target_type     TEXT,                               -- 'order','product', etc.
    target_id       TEXT,                               -- UUID of the affected record
    details         JSONB DEFAULT '{}'::jsonb,          -- additional context
    ip_address      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    target_role     TEXT REFERENCES admin_roles(id),    -- NULL = all admins
    target_user_id  UUID REFERENCES admin_users(id),    -- NULL = role-based
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    type            TEXT DEFAULT 'info'
                    CHECK (type IN ('info','warning','error','success','order','stock','return')),
    is_read         BOOLEAN DEFAULT FALSE,
    link            TEXT,                               -- deep link to relevant page
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE store_settings (
    key             TEXT PRIMARY KEY,
    value           JSONB NOT NULL,
    description     TEXT,
    updated_by      UUID REFERENCES admin_users(id),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- ▸ Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER trg_products_updated_at    BEFORE UPDATE ON products     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_accessories_updated_at BEFORE UPDATE ON accessories  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_profiles_updated_at    BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_addresses_updated_at   BEFORE UPDATE ON addresses    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at      BEFORE UPDATE ON orders       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_coupons_updated_at     BEFORE UPDATE ON coupons      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_admin_updated_at       BEFORE UPDATE ON admin_users  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_inventory_updated_at   BEFORE UPDATE ON inventory    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_expenses_updated_at    BEFORE UPDATE ON expenses     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_suppliers_updated_at   BEFORE UPDATE ON suppliers    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_purchase_orders_updated BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_returns_updated_at     BEFORE UPDATE ON returns      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_shipping_updated_at    BEFORE UPDATE ON shipping_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_store_settings_updated BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ▸ Auto-generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
    NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END; $$;

CREATE TRIGGER trg_generate_order_number BEFORE INSERT ON orders
    FOR EACH ROW WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_order_number();

-- ▸ Auto-generate PO numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
    NEW.po_number := 'PO-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('po_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END; $$;

CREATE TRIGGER trg_generate_po_number BEFORE INSERT ON purchase_orders
    FOR EACH ROW WHEN (NEW.po_number IS NULL) EXECUTE FUNCTION generate_po_number();

-- ▸ Auto-generate return numbers
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
    NEW.return_number := 'RET-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('return_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END; $$;

CREATE TRIGGER trg_generate_return_number BEFORE INSERT ON returns
    FOR EACH ROW WHEN (NEW.return_number IS NULL) EXECUTE FUNCTION generate_return_number();

-- ▸ Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
    RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ▸ Enforce single default address
CREATE OR REPLACE FUNCTION enforce_single_default_address()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE addresses SET is_default = FALSE WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END; $$;

CREATE TRIGGER trg_enforce_single_default BEFORE INSERT OR UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION enforce_single_default_address();

-- ▸ Enforce max 10 addresses
CREATE OR REPLACE FUNCTION enforce_max_addresses()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
DECLARE cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM addresses WHERE user_id = NEW.user_id;
    IF cnt >= 10 THEN RAISE EXCEPTION 'Maximum of 10 addresses allowed per user'; END IF;
    RETURN NEW;
END; $$;

CREATE TRIGGER trg_max_addresses BEFORE INSERT ON addresses
    FOR EACH ROW EXECUTE FUNCTION enforce_max_addresses();


-- =============================================================================
-- 🔒 SECURE ADMIN FUNCTIONS (SECURITY DEFINER — runs with elevated privileges)
-- =============================================================================

-- ▸ Secure Admin Login (password never exposed to client)
CREATE OR REPLACE FUNCTION admin_login(p_email TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_user RECORD;
    v_role RECORD;
BEGIN
    SELECT au.id, au.email, au.role_id, au.full_name, au.is_active, au.avatar_url
    INTO v_user
    FROM admin_users au
    WHERE au.email = LOWER(p_email) AND au.password = p_password;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password');
    END IF;

    IF NOT v_user.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Account is deactivated');
    END IF;

    -- Get role info
    SELECT ar.id, ar.label, ar.modules INTO v_role FROM admin_roles ar WHERE ar.id = v_user.role_id;

    -- Update last login
    UPDATE admin_users SET last_login = NOW() WHERE id = v_user.id;

    -- Log the login
    INSERT INTO admin_audit_log (admin_id, admin_email, action, module, details)
    VALUES (v_user.id, v_user.email, 'login', 'auth', '{}'::jsonb);

    RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
            'id', v_user.id,
            'email', v_user.email,
            'full_name', v_user.full_name,
            'avatar_url', v_user.avatar_url,
            'role', v_role.id,
            'role_label', v_role.label,
            'modules', v_role.modules
        )
    );
END; $$;

-- ▸ Check if admin has permission for a module
CREATE OR REPLACE FUNCTION admin_check_permission(p_admin_id UUID, p_module TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_modules JSONB;
    v_role TEXT;
BEGIN
    SELECT au.role_id, ar.modules INTO v_role, v_modules
    FROM admin_users au JOIN admin_roles ar ON au.role_id = ar.id
    WHERE au.id = p_admin_id AND au.is_active = TRUE;

    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF v_role = 'super_admin' THEN RETURN TRUE; END IF;

    RETURN v_modules ? p_module;
END; $$;

-- ▸ Log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_id UUID, p_action TEXT, p_module TEXT, p_target_id TEXT DEFAULT NULL, p_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE v_email TEXT;
BEGIN
    SELECT email INTO v_email FROM admin_users WHERE id = p_admin_id;
    INSERT INTO admin_audit_log (admin_id, admin_email, action, module, target_id, details)
    VALUES (p_admin_id, v_email, p_action, p_module, p_target_id, p_details);
END; $$;


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE admin_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons                ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_tracking      ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns                ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings         ENABLE ROW LEVEL SECURITY;

-- ───── Admin Roles & Users: SERVICE ROLE ONLY (no public access!) ─────
CREATE POLICY "admin_roles_service_only" ON admin_roles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_users_service_only" ON admin_users FOR ALL USING (auth.role() = 'service_role');

-- ───── Products & Accessories: Public read, authenticated users + service can write ─────
CREATE POLICY "products_public_read"  ON products    FOR SELECT USING (true);
CREATE POLICY "products_service_write" ON products   FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "accessories_public_read"  ON accessories FOR SELECT USING (true);
CREATE POLICY "accessories_service_write" ON accessories FOR ALL USING (auth.role() = 'service_role');

-- ───── Profiles: Users manage their own ─────
CREATE POLICY "profiles_own_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_service"    ON profiles FOR ALL USING (auth.role() = 'service_role');

-- ───── Addresses: Users manage their own ─────
CREATE POLICY "addresses_own_select" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_insert" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_own_update" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_delete" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- ───── Orders: Users view/create their own ─────
CREATE POLICY "orders_own_select"  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_own_insert"  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_service"     ON orders FOR ALL USING (auth.role() = 'service_role');

-- ───── Order Items: Follow order access ─────
CREATE POLICY "order_items_own_select" ON order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "order_items_own_insert" ON order_items FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "order_items_service" ON order_items FOR ALL USING (auth.role() = 'service_role');

-- ───── Coupons: Public read active, service write ─────
CREATE POLICY "coupons_public_read"  ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "coupons_service_write" ON coupons FOR ALL USING (auth.role() = 'service_role');

-- ───── ERP Tables: SERVICE ROLE ONLY (admin panel uses Edge Functions) ─────
CREATE POLICY "inventory_service_only"       ON inventory              FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "inv_transactions_service"     ON inventory_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "suppliers_service_only"       ON suppliers              FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "purchase_orders_service"      ON purchase_orders        FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "po_items_service"             ON purchase_order_items   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "expense_cats_service"         ON expense_categories     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "expenses_service_only"        ON expenses               FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "shipping_service_only"        ON shipping_tracking      FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "returns_service_only"         ON returns                FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "audit_log_service_only"       ON admin_audit_log        FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "notifications_service_only"   ON notifications          FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "store_settings_service_only"  ON store_settings         FOR ALL USING (auth.role() = 'service_role');


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ▸ Admin Roles (12 roles)
INSERT INTO admin_roles (id, label, description, modules, is_system) VALUES
('super_admin',       'Super Admin',       'Full access to all 18 modules',
 '["dashboard","orders","products","inventory","sales","expenses","profit_loss","customers","coupons","shipping","returns","suppliers","purchase_orders","reports","team","audit_log","notifications","settings"]', TRUE),

('admin',             'Admin',             'Full access except team management & audit log',
 '["dashboard","orders","products","inventory","sales","expenses","profit_loss","customers","coupons","shipping","returns","suppliers","purchase_orders","reports","notifications","settings"]', TRUE),

('operations_manager','Operations Manager','Orders, inventory, shipping, returns, suppliers',
 '["dashboard","orders","inventory","shipping","returns","suppliers","purchase_orders","reports"]', TRUE),

('sales_manager',     'Sales Manager',     'Sales analytics, customers, coupons',
 '["dashboard","orders","sales","customers","coupons","reports"]', TRUE),

('finance_manager',   'Finance Manager',   'Revenue, expenses, P&L',
 '["dashboard","sales","expenses","profit_loss","reports"]', TRUE),

('inventory_manager', 'Inventory Manager', 'Products, stock, suppliers',
 '["dashboard","products","inventory","suppliers","purchase_orders"]', TRUE),

('sales_rep',         'Sales Rep',         'Orders and customers',
 '["dashboard","orders","customers","coupons"]', FALSE),

('warehouse_staff',   'Warehouse Staff',   'Inventory and shipping',
 '["dashboard","inventory","shipping","purchase_orders"]', FALSE),

('accountant',        'Accountant',        'Expenses and reporting',
 '["dashboard","expenses","profit_loss","reports"]', FALSE),

('customer_support',  'Customer Support',  'Orders, customers, returns',
 '["dashboard","orders","customers","returns"]', FALSE),

('marketing',         'Marketing',         'Customers, coupons, reports',
 '["dashboard","customers","coupons","reports"]', FALSE),

('viewer',            'Viewer',            'Dashboard read-only access',
 '["dashboard"]', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ▸ Default Super Admin (THE owner)
INSERT INTO admin_users (email, password, role_id, full_name) VALUES
    ('adminnitin@gmail.com', 'adminnitin', 'super_admin', 'Nitin Bharwad')
ON CONFLICT (email) DO NOTHING;

-- ▸ Products
INSERT INTO products (name, value, price, image_url, filter_style) VALUES
    ('Space Gray', '#5e5e63', 549.00, '/products/airpods-max-select.png', 'brightness(0.4)'),
    ('Silver',     '#e3e4e5', 549.00, '/products/airpods-max-select.png', 'none'),
    ('Sky Blue',   '#a4c4d6', 549.00, '/products/airpods-max-select.png', 'sepia(1) saturate(2) hue-rotate(170deg) brightness(0.9) contrast(0.9)'),
    ('Pink',       '#eeb3b6', 549.00, '/products/airpods-max-select.png', 'sepia(1) saturate(1.5) hue-rotate(320deg) brightness(0.9) contrast(0.9)'),
    ('Green',      '#a9cbad', 549.00, '/products/airpods-max-select.png', 'sepia(1) saturate(1.5) hue-rotate(80deg) brightness(0.9) contrast(0.9)')
ON CONFLICT (name) DO NOTHING;

-- ▸ Accessories
INSERT INTO accessories (slug, name, description, price, image_url, is_applecare) VALUES
    ('applecare', 'AppleCare+ for Headphones', 'Extended warranty and accidental damage coverage', 59.00, NULL, TRUE),
    ('adapter',   '20W USB-C Power Adapter',   'Fast-charge your AirPods Max',                   19.00, '/products/20w-adapter.png', FALSE),
    ('cable',     'Lightning to 3.5 mm Audio Cable - 1.2m', 'Connect to non-wireless audio sources', 35.00, '/products/audio-cable.png', FALSE)
ON CONFLICT (slug) DO NOTHING;

-- ▸ Coupons
INSERT INTO coupons (code, discount_type, discount_value, expiry_date) VALUES
    ('APPLE', 'percent', 10, NOW() + INTERVAL '1 year'),
    ('HELLO', 'fixed',   20, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

-- ▸ Expense Categories
INSERT INTO expense_categories (name, description, color) VALUES
    ('Inventory Purchase',  'Cost of goods purchased from suppliers',  '#3B82F6'),
    ('Shipping & Logistics','Shipping costs, packaging, carriers',     '#F59E0B'),
    ('Marketing',           'Ads, promotions, sponsorships',           '#8B5CF6'),
    ('Operations',          'Rent, utilities, software subscriptions', '#EF4444'),
    ('Payroll',             'Staff salaries and benefits',             '#10B981'),
    ('Taxes & Fees',        'Government taxes, platform fees',         '#6B7280'),
    ('Refunds',             'Customer refund amounts',                 '#EC4899'),
    ('Other',               'Miscellaneous expenses',                  '#78716C')
ON CONFLICT (name) DO NOTHING;

-- ▸ Default Store Settings
INSERT INTO store_settings (key, value, description) VALUES
    ('store_name',    '"Apple AirPods Max Store"',     'Store display name'),
    ('store_email',   '"adminnitin@gmail.com"',        'Store contact email'),
    ('currency',      '"USD"',                         'Default currency'),
    ('tax_rate',      '0',                             'Tax rate percentage'),
    ('free_shipping_threshold', '0',                   'Order amount for free shipping'),
    ('low_stock_alert', '10',                          'Alert when stock falls below this')
ON CONFLICT (key) DO NOTHING;

-- ▸ Initial Inventory (one record per product/accessory)
INSERT INTO inventory (product_id, item_name, sku, current_stock, reorder_point, reorder_qty, unit_cost)
SELECT id, name, 'APM-' || UPPER(REPLACE(name, ' ', '-')), 100, 10, 50, 350.00
FROM products
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (accessory_id, item_name, sku, current_stock, reorder_point, reorder_qty, unit_cost)
SELECT id, name, 'ACC-' || UPPER(REPLACE(slug, '-', '')), 200, 20, 100,
    CASE WHEN slug = 'applecare' THEN 0 ELSE price * 0.5 END
FROM accessories
ON CONFLICT (sku) DO NOTHING;
