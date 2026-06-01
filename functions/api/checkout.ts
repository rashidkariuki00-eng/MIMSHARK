// Cloudflare Pages Function — Checkout API
// Saves order to D1, WhatsApp message is built on the frontend
interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as {
      customer_name?: string;
      customer_phone?: string;
      items: Array<{ product_id: string; quantity: number; price: number }>;
      delivery_address: string;
      notes?: string;
      // legacy fields (ignored)
      buyer_id?: string;
      buyer_phone?: string;
    };

    if (!body.items || body.items.length === 0) {
      return json({ error: "No items in order" }, 400);
    }

    const customerName  = body.customer_name  || "Guest";
    const customerPhone = body.customer_phone || body.buyer_phone || "Not provided";

    // Delivery fee tiers
    const subtotal = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee =
      subtotal <= 100  ? 40  :
      subtotal <= 200  ? 70  :
      subtotal <= 400  ? 90  :
      subtotal <= 800  ? 120 :
      subtotal <= 1500 ? 150 : 200;
    const totalAmount = subtotal + deliveryFee;

    const orderId      = crypto.randomUUID();
    const orderNumber  = `MS${Date.now().toString().slice(-8)}`;

    // Save order
    await context.env.DB.prepare(`
      INSERT INTO orders (id, order_number, customer_name, customer_phone, delivery_address, subtotal, delivery_fee, total_amount, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(orderId, orderNumber, customerName, customerPhone, body.delivery_address, subtotal, deliveryFee, totalAmount, body.notes || null).run();

    // Save order items (fetch product title for the record)
    for (const item of body.items) {
      const product = await context.env.DB.prepare(
        "SELECT title, image_url FROM products WHERE id = ?"
      ).bind(item.product_id).first() as { title?: string; image_url?: string } | null;

      await context.env.DB.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_title, product_image_url, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        orderId,
        item.product_id,
        product?.title || "Unknown Product",
        product?.image_url || null,
        item.quantity,
        item.price
      ).run();
    }

    return json({ success: true, order_id: orderId, order_number: orderNumber, subtotal, delivery_fee: deliveryFee, total_amount: totalAmount });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return json({ error: error.message }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
