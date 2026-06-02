import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { setAdminSession } from "@/utils/adminAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hostname = window.location.hostname;
    const isMainProductionDomain = hostname === "Mimshach.co.ke" || hostname === "www.Mimshach.co.ke";
    if (isMainProductionDomain) {
      window.location.href = `https://admin.Mimshach.co.ke/admin/login`;
    }
  }, []);

  const hashPassword = async (pw: string): Promise<string> => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError("Password is required"); return; }
    setIsLoading(true);
    setError("");
    try {
      const entered = await hashPassword(password);
      const expected = import.meta.env.VITE_ADMIN_HASH || "10a5e010e810d49b2e629361a95a7ed4d50ab2ff67edbd31431ff198abd99002";
      if (entered !== expected) {
        setError("Invalid password");
        toast.error("Invalid password");
        setIsLoading(false);
        return;
      }
      setAdminSession();
      toast.success("Welcome, Admin!");
      navigate("/admin/products");
    } catch {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-[#1a1400] to-black">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full p-5">
              <Shield className="h-12 w-12 text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-1">Mimshach Admin</h1>
          <p className="text-[#D4AF37]/50 text-sm">Enter your password to continue</p>
        </div>

        {/* Form — dark card, no white */}
        <form
          onSubmit={submit}
          className="bg-[#0d0b00]/80 backdrop-blur-md rounded-2xl p-7 border border-[#D4AF37]/20 shadow-2xl shadow-black/60"
        >
          <div className="space-y-5">

            {/* Label */}
            <label className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]/60 uppercase tracking-widest">
              <Lock className="h-3.5 w-3.5" />
              Admin Password
            </label>

            {/* Input */}
            <div className="relative">
              <input
                required
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                className={`w-full rounded-xl px-4 py-3.5 pr-12 text-[#D4AF37] placeholder-[#D4AF37]/20 bg-black/50 border outline-none transition-all text-base
                  ${error
                    ? "border-red-500/60 focus:border-red-400"
                    : "border-[#D4AF37]/25 hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 hover:text-[#D4AF37] transition-colors p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-[#C9941A] to-[#D4AF37] py-3.5 font-bold text-black text-sm tracking-wide shadow-lg hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Access Dashboard
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-[#D4AF37]/40 hover:text-[#D4AF37]/80 transition-colors"
          >
            ← Back to Mimshach
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
