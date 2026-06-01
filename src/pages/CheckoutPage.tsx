import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { useShop } from "@/store/shop";
import { CheckCircle2 } from "lucide-react";

const ADMIN_PHONE = "254706752174";

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useShop();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const orderTotal = cartTotal;

  if (cart.length === 0 && !done) {
    return (
      <PageShell title="Checkout">
        <p className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">Your cart is empty.</p>
      </PageShell>
    );
  }

  if (done) {
    return (
      <PageShell title="Order Confirmed">
        <div className="rounded-2xl bg-card p-8 text-center shadow-elevated">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h2 className="mt-3 text-xl font-extrabold">Order Placed!</h2>
          <p className="mt-1 text-sm text-muted-foreground">Order #{orderNumber} sent to admin via WhatsApp.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-full gradient-accent px-8 py-2.5 text-sm font-bold text-accent-foreground shadow-accent"
          >
            Continue Shopping
          </button>
        </div>
      </PageShell>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const newOrderNumber = `MS${Date.now().toString().slice(-8)}`;
    setOrderNumber(newOrderNumber);

    const itemsList = cart
      .map(({ product, qty }) => `• ${product.title}${qty > 1 ? ` ×${qty}` : ""} — KES ${(product.price * qty).toLocaleString()}`)
      .join("\n");

    const whatsappMessage =
      `🛒 *New Order — #${newOrderNumber}*\n\n` +
      `👤 *Customer*\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n\n` +
      `📦 *Products Ordered*\n` +
      `${itemsList}\n\n` +
      `📍 *Delivery Address*\n` +
      `${address}\n\n` +
      `💰 *Total: KES ${orderTotal.toLocaleString()}*\n_(No delivery fee)_`;

    // Try to save order to API (non-blocking)
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(({ product, qty }) => ({
            product_id: product.id,
            quantity: qty,
            price: product.price,
          })),
          total_amount: cartTotal,
          delivery_address: address,
          buyer_phone: phone,
          notes: `Customer: ${name} | Phone: ${phone}`,
        }),
      });
    } catch (_) {
      // Continue even if API save fails
    }

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `whatsapp://send?phone=${ADMIN_PHONE}&text=${encodedMessage}`
      : `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`;

    window.location.href = whatsappUrl;
    toast.success("Order sent! Opening WhatsApp...");

    setTimeout(async () => {
      await clearCart();
      setDone(true);
    }, 800);
  };

  return (
    <PageShell title="Checkout">
      <div className="pb-4">
        <form onSubmit={submit} className="grid gap-3 lg:gap-6 lg:grid-cols-[1fr_320px] max-w-7xl mx-auto">
          <div className="space-y-3">
            {/* Customer Details */}
            <div className="rounded-lg lg:rounded-xl bg-card p-4 shadow-card space-y-3">
              <h2 className="text-sm font-bold">Your Details</h2>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full name"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Phone number (e.g. 0712345678)"
                type="tel"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg lg:rounded-xl bg-card p-4 shadow-card">
              <h2 className="text-sm font-bold mb-2">Delivery Address</h2>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Area / estate / nearest landmark"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-20 h-fit rounded-lg lg:rounded-xl bg-card p-4 shadow-elevated flex flex-col">
            <h2 className="text-sm font-bold mb-3">Order Summary</h2>

            <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto mb-3">
              {cart.map(({ product, qty }) => (
                <li key={product.id} className="flex justify-between gap-2 py-1">
                  <span className="line-clamp-2">{product.title} × {qty}</span>
                  <span className="shrink-0 font-bold">KES {(product.price * qty).toLocaleString()}</span>
                </li>
              ))}
            </ul>


            <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold">
              <span>Total</span>
              <span className="text-accent">KES {orderTotal.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-full gradient-accent py-2.5 text-sm font-bold text-accent-foreground shadow-accent hover:scale-[1.02] transition"
            >
              Place Order via WhatsApp
            </button>
          </aside>
        </form>
      </div>
    </PageShell>
  );
};

export default CheckoutPage;
