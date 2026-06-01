import { useNavigate, useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { findProduct, products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/store/shop";
import { ShieldCheck, Star, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const ProductPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useShop();
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const product = await findProduct(id);
      setP(product);
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reviews/${id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <PageShell title="">
        <div className="animate-pulse space-y-4">
          <div className="bg-muted rounded-2xl aspect-square w-full" />
          <div className="bg-muted h-6 rounded w-3/4" />
          <div className="bg-muted h-10 rounded w-1/2" />
        </div>
      </PageShell>
    );
  }

  if (!p) {
    return (
      <PageShell title="Product not found">
        <Link to="/" className="text-accent font-bold">← Back to shop</Link>
      </PageShell>
    );
  }

  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const allImages = [p.image, ...(p.images || [])].filter(Boolean);

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PageShell title="">
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 max-w-full min-w-0">

          {/* Image Carousel */}
          <div className="relative overflow-hidden rounded-2xl bg-card shadow-card">
            <div className="aspect-square w-full relative">
              <img
                src={allImages[currentImageIndex]}
                alt={p.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              {allImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {allImages.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-foreground break-words">{p.title}</h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {p.rating ?? 4.7}
                </span>
                {reviews.length > 0 && <span>· {reviews.length} reviews</span>}
              </div>
            </div>

            {/* Price Card */}
            <div className="rounded-2xl gradient-accent p-4 text-accent-foreground">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-extrabold">KES {p.price.toLocaleString()}</span>
                {p.oldPrice && <span className="text-sm line-through opacity-70">{p.oldPrice.toLocaleString()}</span>}
                {discount > 0 && <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-bold">-{discount}%</span>}
              </div>
            </div>

            {p.description && <p className="text-sm text-foreground/90 break-words">{p.description}</p>}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-accent" /> Fast delivery</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Quality guaranteed</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">Qty</span>
              <div className="flex items-center overflow-hidden rounded-full border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1.5 hover:bg-muted">−</button>
                <span className="px-4 text-sm font-bold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-1.5 hover:bg-muted">+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { addToCart(p, qty); navigate('/checkout'); }}
                className="flex-1 rounded-full gradient-accent px-4 py-3 text-sm font-bold text-accent-foreground shadow-accent hover:scale-105 transition-transform"
              >
                Buy Now
              </button>
              <button
                onClick={() => { addToCart(p, qty); toast.success("Added to cart!"); }}
                className="flex-1 rounded-full bg-secondary px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 fill-warning text-warning" />
              Customer Reviews ({reviews.length})
            </h2>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold">{review.reviewer_name || review.userName || 'Customer'}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at || review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90">{review.review_text || review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-extrabold">You might also like</h2>
            <div className="grid grid-cols-2 gap-1 md:grid-cols-6 md:gap-2">
              {related.map((r) => <ProductCard key={r.id} p={r} />)}
            </div>
          </section>
        )}
      </PageShell>
    </div>
  );
};

export default ProductPage;
