-- Create Products Table (Colors)
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g. "Space Gray", "Silver"
  value text not null, -- hex color e.g. "#5e5e63"
  price numeric not null default 549.00,
  image_url text not null,
  filter_style text, -- CSS filter string
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Accessories Table
create table accessories (
  id text primary key, -- using text ids like 'adapter', 'applecare' to match existing frontend logic for now, or use uuid
  name text not null,
  price numeric not null,
  image_url text,
  is_applecare boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Coupons Table
create table coupons (
  code text primary key,
  discount_type text check (discount_type in ('percent', 'fixed')) not null,
  discount_value numeric not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Orders Table
create table orders (
  id text primary key, -- Order #W...
  customer_name text not null,
  customer_email text, -- Optional for now as we don't strictly capture it in the simplified form, but good to have
  address jsonb,
  items jsonb not null, -- Array of selected items and accessories
  total numeric not null,
  status text default 'Processing',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table products enable row level security;
alter table accessories enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;

-- Policies (Public Read for Products/Accessories)
create policy "Current products are viewable by everyone" on products for select using (true);
create policy "Accessories are viewable by everyone" on accessories for select using (true);
create policy "Coupons are viewable by everyone" on coupons for select using (true);

-- Policies (Insert for Orders - anyone can place order)
create policy "Anyone can insert orders" on orders for insert with check (true);
-- Orders read policy (only admin or own - simplified to admin or created by anon for demo: allow public select for now or restrict?)
-- For this demo, let's allow anyone to read logic is usually handled by server or strict RLS. 
-- We will allow insert for now. Reading usually requires auth.
create policy "Anyone can view their own orders" on orders for select using (true); -- Simplified for demo

-- Insert Initial Data: Products (Colors)
insert into products (name, value, image_url, filter_style) values
('Space Gray', '#5e5e63', '/products/airpods-max-select.png', 'brightness(0.4)'),
('Silver', '#e3e4e5', '/products/airpods-max-select.png', 'none'),
('Sky Blue', '#a4c4d6', '/products/airpods-max-select.png', 'sepia(1) saturate(2) hue-rotate(170deg) brightness(0.9) contrast(0.9)'),
('Pink', '#eeb3b6', '/products/airpods-max-select.png', 'sepia(1) saturate(1.5) hue-rotate(320deg) brightness(0.9) contrast(0.9)'),
('Green', '#a9cbad', '/products/airpods-max-select.png', 'sepia(1) saturate(1.5) hue-rotate(80deg) brightness(0.9) contrast(0.9)');

-- Insert Initial Data: Accessories
insert into accessories (id, name, price, image_url, is_applecare) values
('applecare', 'AppleCare+ for Headphones', 59.00, null, true),
('adapter', '20W USB-C Power Adapter', 19.00, '/products/20w-adapter.png', false),
('cable', 'Lightning to 3.5 mm Audio Cable - 1.2m', 35.00, '/products/audio-cable.png', false);

-- Insert Initial Data: Coupons
insert into coupons (code, discount_type, discount_value) values
('APPLE', 'percent', 10), -- 10%
('HELLO', 'fixed', 20);   -- $20
