-- Admin Users Table for Role-Based Access Control
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Note: In main production, use hashed passwords.
    role TEXT DEFAULT 'admin', -- 'super_admin' or 'admin'
    permissions JSONB DEFAULT '[]'::jsonb, -- Array of strings: ['orders', 'products', 'customers', 'settings']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default Super Admin (Password: adminnitin)
INSERT INTO admin_users (email, password, role, permissions)
VALUES 
    ('adminnitin@gmail.com', 'adminnitin', 'super_admin', '["dashboard", "orders", "products", "customers", "settings"]')
ON CONFLICT (email) DO NOTHING;
