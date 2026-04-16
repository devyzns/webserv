import { useState } from "react";
import SellGasCalc from "@/components/SellGasCalc";
import OilEarningsCalc from "@/components/OilEarningsCalc";
import TimeToOilCalc from "@/components/TimeToOilCalc";
import BuyTimeCalc from "@/components/BuyTimeCalc";
import LayoutDesigner from "@/components/LayoutDesigner";
import GasPriceWidget from "@/components/GasPriceWidget";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseAmount, formatNumber } from "@/lib/parsers";

type Tab = "sellgas" | "oilearnings" | "timetooil" | "buytime" | "layout";

const tabs: { id: Tab; label: string; badge: string; description: string }[] = [
  { id: "sellgas", label: "/sellgas", badge: "SG", description: "Gas earnings" },
  { id: "oilearnings", label: "/oilearnings", badge: "OE", description: "Oil generation" },
  { id: "timetooil", label: "/timetooil", badge: "TT", description: "Time to target" },
  { id: "buytime", label: "/buytime", badge: "BT", description: "Buy time" },
  { id: "layout", label: "/layout", badge: "LD", description: "Layout designer" },
];

interface OilEmpireWorkspaceProps {
  onBackHome: () => void;
}

function SavedConfig() {
  const [rate, setRate] = useLocalStorage("devware_saved_rate", "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const parsed = parseAmount(rate);

  const save = () => {
    if (draft.trim()) setRate(draft.trim());
    setEditing(false);
  };

  return (
    <div className="card-glass rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-xs font-bold shrink-0">
          OPS
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">How much oil they make per second</p>
          {editing ? (
            <input
              autoFocus
              className="input-dark px-2 py-1 rounded text-sm font-mono w-36 mt-0.5"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setEditing(false);
              }}
              onBlur={save}
              placeholder="e.g. 500, 2.5k"
            />
          ) : (
            <button
              onClick={() => {
                setDraft(rate);
                setEditing(true);
              }}
              className="text-left group"
            >
              {parsed !== null ? (
                <span className="text-lg font-bold font-mono text-red-400 group-hover:text-red-300 transition-colors">
                  {formatNumber(parsed)}
                  <span className="text-sm text-muted-foreground">/s</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors font-mono">
                  Click to set rate...
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      {parsed !== null && !editing && (
        <div className="text-right">
          <p className="text-xs text-muted-foreground/40 font-mono">persists on reload</p>
          <button
            onClick={() => {
              setDraft(rate);
              setEditing(true);
            }}
            className="text-xs text-red-500/60 hover:text-red-400 transition-colors font-mono mt-0.5"
          >
            edit
          </button>
        </div>
      )}
    </div>
  );
}

function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center glow-red-sm">
          <span className="text-white font-black tracking-[0.25em] text-sm pl-1">DV</span>
        </div>
        <div className="absolute -inset-1 rounded-[1.15rem] border border-red-500/15 animate-halo-spin" />
      </div>
      <div>
        <h1 className="text-xl font-black tracking-[0.22em] text-white">DEVWARES</h1>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Oil Empire workspace</p>
      </div>
    </div>
  );
}

export default function OilEmpireWorkspace({ onBackHome }: OilEmpireWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>("sellgas");
  const [transitioning, setTransitioning] = useState(false);

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTransitioning(false);
    }, 120);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab)!;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <BrandLockup />

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBackHome}
              className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-200/80 transition-all duration-200 hover:border-red-500/30 hover:text-white hover:-translate-y-0.5"
            >
              &lt;- Home
            </button>
            <div className="rounded-full border border-red-500/20 bg-red-950/30 px-4 py-2 text-xs uppercase tracking-[0.28em] text-red-100/70">
              Exclusive to Oil Empire
            </div>
          </div>
        </div>

        <div className="hero-panel rounded-[1.6rem] p-5 mt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-red-100/50">Main workspace</p>
              <p className="mt-2 text-2xl font-black tracking-[0.14em] text-white">Calculators and layout designer in one place.</p>
            </div>
            <p className="text-sm leading-6 text-zinc-300 max-w-xl">
              Built by devyzns so players can jump from the homepage into a focused tools page without extra clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <GasPriceWidget />
            <SavedConfig />
          </div>
        </div>
      </header>

      <nav className="card-glass rounded-[1.35rem] p-2 mb-5 animate-slide-up">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={[
                "relative rounded-xl border px-3 py-3 text-left transition-all duration-200 group",
                activeTab === tab.id
                  ? "bg-red-950/55 border-red-700/60 shadow-[0_0_18px_rgba(255,70,70,0.14)]"
                  : "border-transparent bg-black/15 hover:bg-white/5 hover:border-white/10 hover:-translate-y-0.5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`block text-xs font-mono font-bold ${activeTab === tab.id ? "text-red-300" : "text-zinc-300"}`}>
                    {tab.label}
                  </span>
                  <span className={`mt-1 block text-xs ${activeTab === tab.id ? "text-red-200/70" : "text-muted-foreground/70"}`}>
                    {tab.description}
                  </span>
                </div>
                <span className={`rounded-md border px-2 py-1 text-[10px] font-mono tracking-[0.2em] ${activeTab === tab.id ? "border-red-500/30 text-red-100 bg-red-950/50" : "border-white/10 text-zinc-400"}`}>
                  {tab.badge}
                </span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-red-300" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className={`card-glass rounded-[1.5rem] p-5 sm:p-6 transition-opacity duration-120 ${transitioning ? "opacity-0" : "opacity-100"}`}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-900/30">
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-xs font-black tracking-[0.2em] text-red-100">
            {activeTabData.badge}
          </div>
          <div>
            <h2 className="font-mono font-bold text-red-300 text-sm">{activeTabData.label}</h2>
            <p className="text-xs text-muted-foreground">{activeTabData.description}</p>
          </div>
        </div>

        {activeTab === "sellgas" && <SellGasCalc />}
        {activeTab === "oilearnings" && <OilEarningsCalc />}
        {activeTab === "timetooil" && <TimeToOilCalc />}
        {activeTab === "buytime" && <BuyTimeCalc />}
        {activeTab === "layout" && <LayoutDesigner />}
      </main>

      {activeTab !== "layout" && (
        <div className="mt-5 card-glass rounded-[1.35rem] p-4 animate-fade-in">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Input Reference</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Amounts", examples: "1k - 1m - 1b - 2.5b" },
              { label: "Percent", examples: "20% - 0.20 - 150%" },
              { label: "Time", examples: "1h - 30m - 1h 30m" },
              { label: "Mixed", examples: "1.5m - 500k - 10b" },
            ].map(item => (
              <div key={item.label} className="bg-black/20 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-300/70 mb-1">{item.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{item.examples}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-5 text-center">
        <p className="text-xs text-muted-foreground/35 font-mono">DEVWARES - Oil Empire only - made by devyzns</p>
      </footer>
    </div>
  );
}
