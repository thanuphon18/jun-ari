import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("--- Creating auth users ---");

  // Admin user (login shortcut: 123 / 123 maps to this)
  const { data: admin, error: adminErr } = await supabase.auth.admin.createUser({
    email: "admin@greenleaf.com",
    password: "123123",
    email_confirm: true,
    user_metadata: { full_name: "Admin User", role: "admin" },
  });
  if (adminErr) console.error("Admin create error:", adminErr.message);
  else console.log("Admin created:", admin.user.id);

  // Customer user
  const { data: customer, error: custErr } = await supabase.auth.admin.createUser({
    email: "customer@test.com",
    password: "123123",
    email_confirm: true,
    user_metadata: { full_name: "Sarah Johnson", role: "customer" },
  });
  if (custErr) console.error("Customer create error:", custErr.message);
  else console.log("Customer created:", customer.user.id);

  // Distributor user
  const { data: distributor, error: distErr } = await supabase.auth.admin.createUser({
    email: "distributor@test.com",
    password: "123123",
    email_confirm: true,
    user_metadata: { full_name: "Mike Chen", role: "distributor" },
  });
  if (distErr) console.error("Distributor create error:", distErr.message);
  else console.log("Distributor created:", distributor.user.id);

  const adminId = admin?.user?.id;
  const customerId = customer?.user?.id;
  const distributorId = distributor?.user?.id;

  if (!adminId || !customerId || !distributorId) {
    console.error("Failed to create all users, aborting seed.");
    process.exit(1);
  }

  // Create distributor profile
  console.log("--- Creating distributor profile ---");
  const { error: dpErr } = await supabase.from("distributor_profiles").insert({
    id: distributorId,
    company_name: "Chen Wellness Distributors",
    tier: "gold",
    credit_limit: 50000.0,
    wallet_balance: 2450.0,
    total_points: 12500,
    tax_id: "TAX-2024-8832",
    shipping_address: {
      line1: "456 Commerce Blvd",
      city: "Portland",
      state: "OR",
      zip: "97201",
    },
  });
  if (dpErr) console.error("Distributor profile error:", dpErr.message);

  // Seed products
  console.log("--- Seeding products ---");
  const products = [
    {
      name: "Organic Green Tea Extract",
      slug: "organic-green-tea-extract",
      description: "Premium organic green tea extract rich in antioxidants. Supports metabolism, heart health, and cognitive function. Sourced from high-altitude tea gardens.",
      category: "supplements",
      image_url: "/placeholder-product.jpg",
      base_price: 29.99,
      tags: ["organic", "antioxidant", "metabolism"],
    },
    {
      name: "Vitamin D3 + K2 Complex",
      slug: "vitamin-d3-k2-complex",
      description: "Synergistic vitamin D3 and K2 formula for optimal calcium absorption and bone health. 5000 IU D3 with 100mcg K2 MK-7.",
      category: "supplements",
      image_url: "/placeholder-product.jpg",
      base_price: 24.99,
      tags: ["vitamin", "bone-health", "immunity"],
    },
    {
      name: "Hyaluronic Acid Serum",
      slug: "hyaluronic-acid-serum",
      description: "Multi-molecular weight hyaluronic acid serum for deep hydration. Plumps fine lines and restores skin elasticity. Fragrance-free.",
      category: "skincare",
      image_url: "/placeholder-product.jpg",
      base_price: 34.99,
      tags: ["hydration", "anti-aging", "serum"],
    },
    {
      name: "Collagen Peptides Powder",
      slug: "collagen-peptides-powder",
      description: "Grass-fed bovine collagen peptides for skin, hair, nails, and joint support. Unflavored, dissolves easily in any beverage.",
      category: "supplements",
      image_url: "/placeholder-product.jpg",
      base_price: 39.99,
      tags: ["collagen", "beauty", "joints"],
    },
    {
      name: "Lavender Essential Oil",
      slug: "lavender-essential-oil",
      description: "100% pure therapeutic-grade lavender essential oil. Promotes relaxation and restful sleep. Steam distilled from French lavender.",
      category: "aromatherapy",
      image_url: "/placeholder-product.jpg",
      base_price: 18.99,
      tags: ["relaxation", "sleep", "pure"],
    },
    {
      name: "Retinol Night Cream",
      slug: "retinol-night-cream",
      description: "Advanced retinol night cream with encapsulated retinol for gentle yet effective anti-aging. Includes niacinamide and peptide complex.",
      category: "skincare",
      image_url: "/placeholder-product.jpg",
      base_price: 44.99,
      tags: ["retinol", "anti-aging", "night-care"],
    },
    {
      name: "Probiotic 50 Billion CFU",
      slug: "probiotic-50-billion",
      description: "High-potency probiotic with 12 clinically studied strains. Shelf-stable formula with delayed-release capsules for maximum gut delivery.",
      category: "supplements",
      image_url: "/placeholder-product.jpg",
      base_price: 32.99,
      tags: ["gut-health", "probiotic", "immunity"],
    },
    {
      name: "Magnesium Glycinate",
      slug: "magnesium-glycinate",
      description: "Highly bioavailable magnesium glycinate for muscle relaxation, sleep quality, and stress management. 400mg elemental magnesium per serving.",
      category: "supplements",
      image_url: "/placeholder-product.jpg",
      base_price: 22.99,
      tags: ["magnesium", "sleep", "relaxation"],
    },
  ];

  const { data: insertedProducts, error: prodErr } = await supabase
    .from("products")
    .insert(products)
    .select("id, slug, base_price");
  if (prodErr) {
    console.error("Product insert error:", prodErr.message);
    process.exit(1);
  }
  console.log(`Inserted ${insertedProducts.length} products`);

  // Seed variants + inventory for each product
  console.log("--- Seeding variants & inventory ---");
  const variantRows = [];
  for (const p of insertedProducts) {
    variantRows.push(
      {
        product_id: p.id,
        sku: `${p.slug.substring(0, 8).toUpperCase()}-SM`,
        name: "30 Count",
        price: p.base_price,
        cost: +(p.base_price * 0.4).toFixed(2),
        weight_grams: 120,
        attributes: { size: "30 count" },
      },
      {
        product_id: p.id,
        sku: `${p.slug.substring(0, 8).toUpperCase()}-LG`,
        name: "90 Count",
        price: +(p.base_price * 2.5).toFixed(2),
        cost: +(p.base_price * 0.4 * 2.5).toFixed(2),
        weight_grams: 300,
        attributes: { size: "90 count" },
      }
    );
  }

  const { data: insertedVariants, error: varErr } = await supabase
    .from("product_variants")
    .insert(variantRows)
    .select("id, product_id, sku");
  if (varErr) {
    console.error("Variant insert error:", varErr.message);
    process.exit(1);
  }
  console.log(`Inserted ${insertedVariants.length} variants`);

  // Inventory for each variant
  const inventoryRows = insertedVariants.map((v, i) => ({
    variant_id: v.id,
    warehouse: "main",
    qty_on_hand: 50 + (i * 15),
    qty_reserved: i % 3 === 0 ? 5 : 0,
    reorder_level: 10,
    reorder_qty: 50,
  }));

  const { error: invErr } = await supabase.from("inventory").insert(inventoryRows);
  if (invErr) console.error("Inventory error:", invErr.message);
  else console.log(`Inserted ${inventoryRows.length} inventory records`);

  // Seed orders
  console.log("--- Seeding orders ---");
  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "delivered"];
  const payStatuses = ["unpaid", "paid", "paid", "paid", "paid", "paid"];

  const orderRows = [];
  for (let i = 0; i < 12; i++) {
    const isB2B = i >= 8;
    const userId = isB2B ? distributorId : customerId;
    const si = i % statuses.length;
    const date = new Date();
    date.setDate(date.getDate() - (12 - i) * 3);

    orderRows.push({
      order_number: `GRN-${String(1001 + i)}`,
      user_id: userId,
      channel: isB2B ? "b2b" : "b2c",
      status: statuses[si],
      payment_status: payStatuses[si],
      subtotal: +(50 + i * 25).toFixed(2),
      discount_amount: i % 4 === 0 ? 5.0 : 0,
      tax_amount: +((50 + i * 25) * 0.08).toFixed(2),
      shipping_amount: isB2B ? 0 : 5.99,
      total: +((50 + i * 25) * 1.08 + (isB2B ? 0 : 5.99) - (i % 4 === 0 ? 5 : 0)).toFixed(2),
      shipping_address: {
        line1: isB2B ? "456 Commerce Blvd" : "123 Main St",
        city: isB2B ? "Portland" : "Austin",
        state: isB2B ? "OR" : "TX",
        zip: isB2B ? "97201" : "73301",
      },
      po_number: isB2B ? `PO-${2000 + i}` : null,
      created_at: date.toISOString(),
    });
  }

  const { data: insertedOrders, error: ordErr } = await supabase
    .from("orders")
    .insert(orderRows)
    .select("id, order_number, user_id");
  if (ordErr) {
    console.error("Order insert error:", ordErr.message);
    process.exit(1);
  }
  console.log(`Inserted ${insertedOrders.length} orders`);

  // Order items (2 items per order picking random variants)
  console.log("--- Seeding order items ---");
  const itemRows = [];
  for (const order of insertedOrders) {
    const v1 = insertedVariants[Math.floor(Math.random() * insertedVariants.length)];
    const v2 = insertedVariants[Math.floor(Math.random() * insertedVariants.length)];
    const prod1 = insertedProducts.find((p) => p.id === v1.product_id);
    const prod2 = insertedProducts.find((p) => p.id === v2.product_id);
    itemRows.push(
      {
        order_id: order.id,
        variant_id: v1.id,
        product_name: prod1?.slug?.replace(/-/g, " ") || "Product",
        variant_name: v1.sku.endsWith("-SM") ? "30 Count" : "90 Count",
        sku: v1.sku,
        quantity: 1 + Math.floor(Math.random() * 3),
        unit_price: prod1?.base_price || 29.99,
        total_price: prod1?.base_price || 29.99,
      },
      {
        order_id: order.id,
        variant_id: v2.id,
        product_name: prod2?.slug?.replace(/-/g, " ") || "Product",
        variant_name: v2.sku.endsWith("-SM") ? "30 Count" : "90 Count",
        sku: v2.sku,
        quantity: 1 + Math.floor(Math.random() * 2),
        unit_price: prod2?.base_price || 24.99,
        total_price: prod2?.base_price || 24.99,
      }
    );
  }

  const { error: itemErr } = await supabase.from("order_items").insert(itemRows);
  if (itemErr) console.error("Order items error:", itemErr.message);
  else console.log(`Inserted ${itemRows.length} order items`);

  // Discount codes
  console.log("--- Seeding discount codes ---");
  const { error: dcErr } = await supabase.from("discount_codes").insert([
    {
      code: "WELCOME10",
      description: "10% off for new customers",
      discount_type: "percentage",
      discount_value: 10,
      min_order_amount: 25,
      max_uses: 1000,
      current_uses: 42,
      valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
    },
    {
      code: "SAVE5",
      description: "$5 off any order over $50",
      discount_type: "fixed",
      discount_value: 5,
      min_order_amount: 50,
      max_uses: 500,
      current_uses: 18,
      valid_until: new Date(Date.now() + 60 * 86400000).toISOString(),
    },
    {
      code: "B2BBULK15",
      description: "15% off B2B bulk orders",
      discount_type: "percentage",
      discount_value: 15,
      min_order_amount: 200,
      max_uses: 100,
      current_uses: 5,
      valid_until: new Date(Date.now() + 180 * 86400000).toISOString(),
    },
  ]);
  if (dcErr) console.error("Discount codes error:", dcErr.message);

  // Points ledger entries for distributor
  console.log("--- Seeding points ledger ---");
  const { error: plErr } = await supabase.from("points_ledger").insert([
    { user_id: distributorId, points: 5000, type: "earned", description: "Welcome bonus" },
    { user_id: distributorId, points: 3500, type: "earned", description: "Q4 order volume bonus" },
    { user_id: distributorId, points: 4000, type: "earned", description: "Monthly order rewards" },
    { user_id: distributorId, points: -500, type: "redeemed", description: "Redeemed for $50 credit" },
    { user_id: customerId, points: 500, type: "earned", description: "First purchase bonus" },
    { user_id: customerId, points: 150, type: "earned", description: "Product review reward" },
  ]);
  if (plErr) console.error("Points error:", plErr.message);

  console.log("\n=== SEED COMPLETE ===");
  console.log("Admin login: admin@greenleaf.com / 123123 (or use shortcut 123 / 123)");
  console.log("Customer login: customer@test.com / 123123");
  console.log("Distributor login: distributor@test.com / 123123");
}

seed().catch(console.error);
