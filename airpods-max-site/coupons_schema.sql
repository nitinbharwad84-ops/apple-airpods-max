-- Re-create Coupons Table to ensure correct schema
DROP TABLE IF EXISTS coupons;

CREATE TABLE coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL, -- Renamed from 'value' to avoid keyword conflicts
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a sample coupon
INSERT INTO coupons (code, discount_type, discount_value, expiry_date)
VALUES 
    ('WELCOME10', 'percentage', 10, timezone('utc'::text, now()) + interval '30 days')
ON CONFLICT (code) DO NOTHING;
