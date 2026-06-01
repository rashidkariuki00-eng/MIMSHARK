import { useState, type FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera, X, Loader2, Home, ChefHat, Shirt } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { uploadImages, validateImage } from "@/lib/uploadImage";

const CATEGORIES = [
  { slug: "home-accessories", label: "Home", icon: Home, description: "Décor, furniture, bedding, accessories" },
  { slug: "kitchen",          label: "Kitchen", icon: ChefHat, description: "Cookware, utensils, appliances" },
  { slug: "outfits",          label: "Outfits", icon: Shirt, description: "Fashion, clothing, accessories" },
];

const SellPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    currentPrice: "",
    originalPrice: "",
    category: "home-accessories",
    description: "",
    stock_quantity: "1",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const discountPercentage =
    form.currentPrice && form.originalPrice
      ? Math.round((1 - parseFloat(form.currentPrice) / parseFloat(form.originalPrice)) * 100)
      : 0;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    for (const file of files) {
      const validation = validateImage(file);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid image");
        return;
      }
    }
    setUploading(true);
    try {
      const uploadedUrls = await uploadImages(files);
      setPhotos([...photos, ...files]);
      setPhotoUrls([...photoUrls, ...uploadedUrls]);
      toast.success(`${files.length} photo(s) uploaded`);
    } catch {
      toast.error("Failed to upload photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.currentPrice || !form.category) {
      toast.error("Title, price and category are required");
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        price: parseFloat(form.currentPrice),
        original_price: form.originalPrice ? parseFloat(form.originalPrice) : null,
        image_url: photoUrls[0] || null,
        images: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
        stock_quantity: parseInt(form.stock_quantity) || 1,
        is_available: true,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Session": "true",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save product");
      }

      toast.success("Product posted successfully!", {
        description: "It is now live in the shop.",
      });

      setForm({ title: "", currentPrice: "", originalPrice: "", category: "", description: "", stock_quantity: "1" });
      setPhotos([]);
      setPhotoUrls([]);
      setTimeout(() => navigate("/admin/products"), 1200);
    } catch (error: any) {
      console.error("Error posting product:", error);
      toast.error(error.message || "Failed to post product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Post New Product">
      <form onSubmit={submit} className="grid gap-5 rounded-2xl bg-card p-6 shadow-card md:max-w-2xl">

        {/* Photo Upload */}
        <Field label="Photos (up to 5)">
          <div className="grid grid-cols-5 gap-2">
            {photoUrls.map((url, i) => (
              <div key={i} className="relative aspect-square">
                <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted hover:bg-secondary transition disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Add</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
        </Field>

        {/* Title */}
        <Field label="Product Title *">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Elegant Gold Curtains"
            className="input"
            required
          />
        </Field>

        {/* Category — 3 fixed options */}
        <Field label="Category *">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ slug, label, icon: Icon, description }) => {
              const active = form.category === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setForm({ ...form, category: slug })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-muted text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${active ? "text-primary" : ""}`} />
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] leading-tight opacity-70">{description}</span>
                </button>
              );
            })}
          </div>
        </Field>

        {/* Pricing */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Price (KES) *">
            <input
              type="number"
              min="0"
              value={form.currentPrice}
              onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
              placeholder="2500"
              className="input"
              required
            />
          </Field>
          <Field label="Original Price (KES) — for discount">
            <input
              type="number"
              min="0"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              placeholder="5000"
              className="input"
            />
          </Field>
        </div>

        {discountPercentage > 0 && (
          <div className="rounded-lg bg-accent/10 p-3 text-center">
            <span className="text-sm font-bold text-accent">{discountPercentage}% OFF — Great Deal!</span>
          </div>
        )}

        {/* Stock */}
        <Field label="Stock Quantity">
          <input
            type="number"
            min="1"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
            placeholder="1"
            className="input"
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Product details, materials, dimensions, care instructions..."
            className="input"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-full gradient-accent py-3 text-sm font-bold text-accent-foreground shadow-accent hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Posting...
            </span>
          ) : "Post Product"}
        </button>
      </form>

      <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.6rem 0.85rem;font-size:0.875rem;outline:none;color:hsl(var(--foreground))}.input:focus{box-shadow:0 0 0 2px hsl(var(--primary)/.4)}`}</style>
    </PageShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold text-foreground">{label}</span>
    {children}
  </label>
);

export default SellPage;
