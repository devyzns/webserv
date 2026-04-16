import { useEffect, useState } from "react";
import HomeLanding from "@/components/HomeLanding";
import OilEmpireWorkspace from "@/components/OilEmpireWorkspace";

type View = "home" | "oil-empire";

function getViewFromHash(): View {
  if (typeof window === "undefined") return "home";
  return window.location.hash.replace("#", "").toLowerCase() === "oil-empire"
    ? "oil-empire"
    : "home";
}

function ParticleOrb({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: "radial-gradient(circle, hsla(0, 88%, 55%, 0.18), transparent 72%)",
        animation: `pulse-glow ${2.8 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        filter: "blur(2px)",
      }}
    />
  );
}

export default function App() {
  const [view, setView] = useState<View>(() => getViewFromHash());

  useEffect(() => {
    const syncFromHash = () => setView(getViewFromHash());
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    document.title = view === "home" ? "Devwares" : "Devwares | Oil Empire";
  }, [view]);

  const openOilEmpire = () => {
    setView("oil-empire");
    window.location.hash = "oil-empire";
  };

  const goHome = () => {
    setView("home");
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
  };

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <ParticleOrb x={10} y={12} size={260} delay={0} />
      <ParticleOrb x={84} y={18} size={180} delay={1.4} />
      <ParticleOrb x={73} y={78} size={220} delay={0.8} />
      <ParticleOrb x={18} y={72} size={160} delay={2} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,60,60,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,90,40,0.1),transparent_28%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/80 to-transparent opacity-80" />

      <div className="relative z-10">
        {view === "home" ? (
          <HomeLanding onEnterOilEmpire={openOilEmpire} />
        ) : (
          <OilEmpireWorkspace onBackHome={goHome} />
        )}
      </div>
    </div>
  );
}
