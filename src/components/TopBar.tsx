import { Search, ShoppingCart } from "lucide-react";
import { Logo } from "./Logo";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useShop } from "@/store/shop";

export const TopBar = () => {
  const navigate = useNavigate();
  const { cartCount } = useShop();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-lg"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1400 60%, #0a0a0a 100%)", borderBottom: "1px solid #D4AF37" }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" aria-label="Mimshach home">
          <Logo />
        </Link>

        {/* Desktop search */}
        <form onSubmit={submit} className="relative ml-4 hidden flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search home accessories, outfits, kitchen..."
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-24 text-sm outline-none ring-primary/40 focus:ring-2"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full gradient-accent px-4 py-1.5 text-xs font-bold text-accent-foreground shadow-accent">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={submit} className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </form>
    </header>
  );
};
