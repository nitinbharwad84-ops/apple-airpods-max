-- Create Dummy Data for Orders
DO $$
DECLARE
    i INT;
    order_id TEXT;
    statuses TEXT[] := ARRAY['Processing', 'Shipped', 'Delivered'];
    names TEXT[] := ARRAY['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'David Lee', 'Emma Wilson', 'Frank Thomas', 'Grace Miller', 'Hannah Davis', 'Ian Clark', 'Jane Doe'];
    item_json JSONB;
    total_val NUMERIC;
BEGIN
    FOR i IN 1..15 LOOP
        order_id := 'W' || floor(random() * 900000 + 100000)::text;
        
        -- Random items
        IF (random() > 0.5) THEN
            item_json := '[{"type": "product", "name": "Space Gray", "price": 549, "quantity": 1}, {"type": "accessory", "name": "AppleCare+ for Headphones", "price": 59}]';
            total_val := 608.00;
        ELSE
            item_json := '[{"type": "product", "name": "Silver", "price": 549, "quantity": 1}]';
            total_val := 549.00;
        END IF;

        INSERT INTO orders (id, customer_name, items, total, status, created_at, address)
        VALUES (
            order_id,
            names[1 + floor(random() * array_length(names, 1))],
            item_json,
            total_val,
            statuses[1 + floor(random() * array_length(statuses, 1))],
            NOW() - (random() * interval '30 days'),
            '{"city": "Cupertino", "address": "1 Infinite Loop", "zip": "95014"}'::jsonb
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;
