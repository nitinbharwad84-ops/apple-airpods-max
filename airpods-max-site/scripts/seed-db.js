const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Hannah', 'Ian', 'Jane'];
const lastNames = ['Johnson', 'Smith', 'Brown', 'Lee', 'Wilson', 'Thomas', 'Miller', 'Davis', 'Clark', 'Doe'];
const statuses = ['Processing', 'Shipped', 'Delivered'];
const colors = ['Space Gray', 'Silver', 'Sky Blue', 'Pink', 'Green'];
const accessoriesList = [
    { name: "AppleCare+ for Headphones", price: 59 },
    { name: "20W USB-C Power Adapter", price: 19 },
    { name: "Lightning to 3.5 mm Audio Cable - 1.2m", price: 35 }
];

async function seedOrders() {
    console.log("Seeding orders...");
    const orders = [];

    for (let i = 0; i < 20; i++) {
        const id = `W${Math.floor(Math.random() * 900000 + 100000)}`;
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const customerName = `${firstName} ${lastName}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Random Items
        const color = colors[Math.floor(Math.random() * colors.length)];
        const items = [
            { type: 'product', name: color, price: 549, quantity: 1 }
        ];

        let total = 549;

        // Randomly add accessory
        if (Math.random() > 0.6) {
            const acc = accessoriesList[Math.floor(Math.random() * accessoriesList.length)];
            items.push({ type: 'accessory', name: acc.name, price: acc.price });
            total += acc.price;
        }

        // Random Date in last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        orders.push({
            id,
            customer_name: customerName,
            address: {
                address: `${Math.floor(Math.random() * 999)} Random St`,
                city: "Tech City",
                zip: "12345"
            },
            items: JSON.stringify(items),
            total,
            status,
            created_at: date.toISOString()
        });
    }

    const { error } = await supabase.from('orders').insert(orders);

    if (error) {
        console.error("Error inserting orders:", error);
    } else {
        console.log("Successfully seeded 20 dummy orders!");
    }
}

seedOrders();
