import { ArrowRight, Flame, Sparkles, Truck, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { FlashCountdown } from "@/components/FlashCountdown";
import { categories, getProducts, getProductsSync, transformDatabaseProduct } from "@/data/products";
const Index = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>(getProductsSync() || []);
  const [trending, setTrending] = useState<ProductWithCategory[]>([]);
  const [justListed, setJustListed] = useState<ProductWithCategory[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingJustListed, setLoadingJustListed] = useState(true);

  // Fetch trending and just listed products
  useEffect(() => {
    const fetchSortedProducts = async () => {
      try {
        // Fetch trending products
        const trendingResponse = await fetch('/api/products?sort=trending&limit=8', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          setTrending(Array.isArray(trendingData) ? trendingData.map(transformDatabaseProduct) : []);
        }
        setLoadingTrending(false);

        // Fetch just listed products
        const newestResponse = await fetch('/api/products?sort=newest&limit=8', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (newestResponse.ok) {
          const newestData = await newestResponse.json();
          setJustListed(Array.isArray(newestData) ? newestData.map(transformDatabaseProduct) : []);
        }
        setLoadingJustListed(false);
      } catch (error) {
        console.error('Error fetching sorted products:', error);
        setLoadingTrending(false);
        setLoadingJustListed(false);
      }
    };

    fetchSortedProducts();
  }, []);

  // Refresh products on mount and when returning to page
  useEffect(() => {
    const refreshProductList = async () => {
      const refreshedProducts = await getProducts();
      // Ensure we always set an array
      setProducts(Array.isArray(refreshedProducts) ? refreshedProducts : []);
    };
    
    // Initial load
    refreshProductList();
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshProductList();
      }
    };
    
    // Listen for storage changes (when products are added)
    window.addEventListener('storage', refreshProductList);
    window.addEventListener('focus', refreshProductList);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', refreshProductList);
      window.removeEventListener('focus', refreshProductList);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">

      <div className="sticky top-0 z-30">
        <TopBar />
        {/* Promo strip */}
        <div className="bg-primary">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-primary-foreground">
            <FlashCountdown />
            <div className="hidden items-center gap-4 sm:flex">
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Free delivery</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Quality guaranteed</span>
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Premium collection</span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-4">
        <div className="py-3">
          <Section icon={<Flame className="h-5 w-5 text-accent" />} title="Trending Now" subtitle="Most popular items this week" link="View All" linkTo="/search?sort=trending">
            <ProductGrid items={trending} loading={loadingTrending} />
          </Section>
        </div>

        <Section icon={<Sparkles className="h-5 w-5 text-accent" />} title="New Arrivals" subtitle="Fresh additions to the collection" link="See More" linkTo="/search?sort=newest">
          <ProductGrid items={justListed} loading={loadingJustListed} />
        </Section>


        {/* Category Sections - All Products by Category */}
        <CategorySections />
      </main>

      <BottomNav />
    </div>
  );
};

const Section = ({ icon, title, subtitle, link, linkTo, children }: { icon: React.ReactNode; title: string; subtitle?: string; link: string; linkTo: string; children: React.ReactNode; }) => (
  <section className="mt-0">
    <div className="mb-2 flex items-end justify-between gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h2 className="text-lg font-extrabold text-foreground md:text-xl">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <Link to={linkTo} className="flex shrink-0 items-center gap-1 text-xs font-bold text-accent hover:gap-2 transition-all">
        {link} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
    {children}
  </section>
);

const ProductGrid = ({ items, loading = false }: { items: any[]; loading?: boolean }) => (
  <div className="-mx-4 overflow-x-auto scrollbar-hide px-4">
    <div className="flex gap-1">
      {loading
        ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
        : items.length > 0
          ? items.map((p) => (
              <div key={p.id} className="w-[calc((100vw-2rem-0.25rem)/2.5)] shrink-0 md:w-[140px]">
                <ProductCard p={p} />
              </div>
            ))
          : null
      }
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="w-[calc((100vw-2rem-0.25rem)/2.5)] shrink-0 md:w-[140px] rounded-xl bg-card overflow-hidden animate-pulse">
    <div className="bg-muted h-32 w-full" />
    <div className="p-2 space-y-1.5">
      <div className="bg-muted rounded h-3 w-3/4" />
      <div className="bg-muted rounded h-3 w-1/2" />
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="mt-6">
    <div className="flex items-center justify-between mb-3">
      <div className="bg-muted rounded h-5 w-32 animate-pulse" />
      <div className="bg-muted rounded h-4 w-16 animate-pulse" />
    </div>
    <div className="-mx-4 overflow-x-hidden px-4">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  </div>
);

// Category Sections Component - Shows products by category
const CategorySections = () => {
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      const productsByCategory: Record<string, any[]> = {};
      try {
        await Promise.all(
          categories.map(async (category) => {
            try {
              const response = await fetch(`/api/products?category=${category.slug}&limit=10`);
              if (response.ok) {
                const data = await response.json();
                productsByCategory[category.slug] = Array.isArray(data) ? data.map(transformDatabaseProduct) : [];
              } else {
                productsByCategory[category.slug] = [];
              }
            } catch {
              productsByCategory[category.slug] = [];
            }
          })
        );
        setCategoryProducts(productsByCategory);
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setFetched(true);
      }
    };
    fetchCategoryProducts();
  }, []);

  if (!fetched) {
    return <>{categories.slice(0, 3).map(c => <SkeletonRow key={c.slug} />)}</>;
  }

  const hasAnyProducts = categories.some(c => (categoryProducts[c.slug] || []).length > 0);

  if (!hasAnyProducts) {
    return (
      <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
        <Zap className="mx-auto h-10 w-10 text-accent opacity-40 mb-3" />
        <p className="text-base font-semibold text-foreground">Products coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">The admin is adding items to the collection.</p>
      </div>
    );
  }

  return (
    <>
      {categories.map((category) => {
        const products = categoryProducts[category.slug] || [];
        if (products.length === 0) return null;
        return (
          <Section
            key={category.slug}
            icon={<Zap className="h-5 w-5 text-accent" />}
            title={category.name}
            subtitle={`Browse our ${category.name.toLowerCase()} collection`}
            link="View All"
            linkTo={`/category/${category.slug}`}
          >
            <ProductGrid items={products} />
          </Section>
        );
      })}
    </>
  );
};

export default Index;
