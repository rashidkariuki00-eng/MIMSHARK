import logo from "@/assets/mimshach-logo.jpeg";

export const Logo = () => (
  <div className="flex items-center gap-2">
    <img src={logo} alt="Mimshach" className="h-7 w-auto object-contain" />
    <div className="leading-none">
      <div
        className="text-sm font-extrabold tracking-widest"
        style={{ background: "linear-gradient(90deg, #D4AF37, #FFE066, #C9941A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        MIMSHACH
      </div>
      <div className="text-[8px] tracking-widest text-muted-foreground font-medium uppercase">
        Household Collection
      </div>
    </div>
  </div>
);
