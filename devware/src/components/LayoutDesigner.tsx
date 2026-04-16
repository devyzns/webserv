import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatNumber } from "@/lib/parsers";

const COLS = 15;
const ROWS = 20;
const CELLS_PER_PLOT = 5;
const CELL_SIZE = 34;
const PLOT_SIZE = CELLS_PER_PLOT * CELL_SIZE + (CELLS_PER_PLOT - 1) * 2; // 178px
const GRID_PAD = 8;

// Returns the earn multiplier for a given plot position
function getPlotMultiplier(plotCol: number, plotRow: number): number {
  if (plotRow === 0) return plotCol === 1 ? 5 : 3; // top row: 3x / 5x / 3x
  if (plotRow === 1) return 2;                       // second row: 2x
  return 1;                                          // rest: 1x
}

function cellPlot(c: number, r: number) {
  return {
    pc: Math.floor(c / CELLS_PER_PLOT),
    pr: Math.floor(r / CELLS_PER_PLOT),
  };
}

interface DrillDef {
  name: string;
  short: string;
  cols: number;
  rows: number;
  rate: number;
  price?: number;
  drop?: boolean;
  color: string;
  bg: string;
  border: string;
}

const DRILL_DEFS: DrillDef[] = [
  // ── 1×1 purchasable (tiered by price) ──────────────────────────────────
  { name: "Basic Drill",         short: "Basic",    cols: 1, rows: 1, rate: 1,    price: 500,          color: "text-slate-300",  bg: "bg-slate-800/80",  border: "border-slate-600/50" },
  { name: "Strong Drill",        short: "Strong",   cols: 1, rows: 1, rate: 3,    price: 1800,         color: "text-slate-300",  bg: "bg-slate-800/80",  border: "border-slate-600/50" },
  { name: "Enhanced Drill",      short: "Enh",      cols: 1, rows: 1, rate: 4,    price: 3600,         color: "text-slate-300",  bg: "bg-slate-800/80",  border: "border-slate-600/50" },
  { name: "Speed Drill",         short: "Speed",    cols: 1, rows: 1, rate: 6,    price: 7200,         color: "text-blue-300",   bg: "bg-blue-900/70",   border: "border-blue-600/50" },
  { name: "Reinforced Drill",    short: "Reinf",    cols: 1, rows: 1, rate: 8,    price: 12000,        color: "text-blue-300",   bg: "bg-blue-900/70",   border: "border-blue-600/50" },
  { name: "Industrial Drill",    short: "Indust",   cols: 1, rows: 1, rate: 10,   price: 20000,        color: "text-blue-300",   bg: "bg-blue-900/70",   border: "border-blue-600/50" },
  { name: "Turbo Drill",         short: "Turbo",    cols: 1, rows: 1, rate: 16,   price: 80000,        color: "text-violet-300", bg: "bg-violet-900/70", border: "border-violet-600/50" },
  { name: "Mega Drill",          short: "Mega",     cols: 1, rows: 1, rate: 20,   price: 140000,       color: "text-violet-300", bg: "bg-violet-900/70", border: "border-violet-600/50" },
  { name: "Mega Emerald Drill",  short: "M.Emer",   cols: 1, rows: 1, rate: 25,   price: 400000,       color: "text-emerald-300",bg: "bg-emerald-900/70",border: "border-emerald-600/50" },
  { name: "Hell Drill",          short: "Hell",     cols: 1, rows: 1, rate: 35,   price: 1225000,      color: "text-orange-300", bg: "bg-orange-900/70", border: "border-orange-600/50" },
  { name: "Plasma Drill",        short: "Plasma",   cols: 1, rows: 1, rate: 50,   price: 4500000,      color: "text-rose-300",   bg: "bg-rose-900/70",   border: "border-rose-600/50" },
  // ── 1×1 drops ──────────────────────────────────────────────────────────
  { name: "Mini Ruby Drill",     short: "M.Ruby",   cols: 1, rows: 1, rate: 67,   drop: true,          color: "text-red-200",    bg: "bg-red-950/90",    border: "border-red-500/70" },
  { name: "Mini Diamond Drill",  short: "M.Dia",    cols: 1, rows: 1, rate: 100,  drop: true,          color: "text-sky-200",    bg: "bg-sky-900/80",    border: "border-sky-500/60" },
  // ── 2×1 purchasable ────────────────────────────────────────────────────
  { name: "Double Industrial",   short: "Dbl Ind",  cols: 2, rows: 1, rate: 12,   price: 30000,        color: "text-amber-300",  bg: "bg-amber-900/70",  border: "border-amber-600/50" },
  // ── 2×1 drops ──────────────────────────────────────────────────────────
  { name: "Quantum Drill",       short: "Quantum",  cols: 2, rows: 1, rate: 175,  drop: true,          color: "text-cyan-200",   bg: "bg-cyan-900/80",   border: "border-cyan-500/60" },
  { name: "Mini Multi Drill",    short: "M.Multi",  cols: 2, rows: 1, rate: 250,  drop: true,          color: "text-purple-200", bg: "bg-purple-900/80", border: "border-purple-500/60" },
  // ── 2×2 purchasable ────────────────────────────────────────────────────
  { name: "Huge Long Drill",     short: "Huge",     cols: 2, rows: 2, rate: 220,  price: 40000000,     color: "text-green-300",  bg: "bg-green-900/70",  border: "border-green-600/50" },
  { name: "Mega Plasma Drill",   short: "M.Plsm",   cols: 2, rows: 2, rate: 275,  price: 95000000,     color: "text-green-300",  bg: "bg-green-900/70",  border: "border-green-600/50" },
  { name: "Multi Drill",         short: "Multi",    cols: 2, rows: 2, rate: 350,  price: 280000000,    color: "text-teal-300",   bg: "bg-teal-900/70",   border: "border-teal-600/50" },
  { name: "Lava Drill",          short: "Lava",     cols: 2, rows: 2, rate: 600,  price: 900000000,    color: "text-orange-200", bg: "bg-orange-950/80", border: "border-orange-500/60" },
  { name: "Ice Plasma Drill",    short: "Ice",      cols: 2, rows: 2, rate: 800,  price: 2400000000,   color: "text-sky-200",    bg: "bg-sky-950/80",    border: "border-sky-500/60" },
  { name: "Crystal Drill",       short: "Crystal",  cols: 2, rows: 2, rate: 1500, price: 9000000000,   color: "text-indigo-200", bg: "bg-indigo-950/80", border: "border-indigo-500/60" },
  { name: "Diamond Drill",       short: "Diamond",  cols: 2, rows: 2, rate: 2750, price: 27500000000,  color: "text-sky-100",    bg: "bg-sky-950/90",    border: "border-sky-400/70" },
  { name: "Ruby Drill",          short: "Ruby",     cols: 2, rows: 2, rate: 4500, price: 85500000000,  color: "text-red-200",    bg: "bg-red-950/90",    border: "border-red-500/70" },
  { name: "Fusion Drill",        short: "Fusion",   cols: 2, rows: 2, rate: 7500, price: 187500000000, color: "text-yellow-200", bg: "bg-yellow-950/80", border: "border-yellow-500/60" },
];

type SizeFilter = "all" | "1x1" | "2x1" | "2x2";

interface PlacedDrill {
  id: string;
  name: string;
  col: number;
  row: number;
  rotated?: boolean;
}

function getDef(name: string): DrillDef {
  return DRILL_DEFS.find(d => d.name === name) ?? DRILL_DEFS[0];
}

function effectiveDims(def: DrillDef, rotated: boolean) {
  return rotated && def.cols !== def.rows
    ? { cols: def.rows, rows: def.cols }
    : { cols: def.cols, rows: def.rows };
}

function buildOccupied(drills: PlacedDrill[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const d of drills) {
    const { cols, rows } = effectiveDims(getDef(d.name), d.rotated ?? false);
    for (let r = d.row; r < d.row + rows; r++) {
      for (let c = d.col; c < d.col + cols; c++) {
        map.set(`${c},${r}`, d.id);
      }
    }
  }
  return map;
}

function canPlace(drills: PlacedDrill[], name: string, col: number, row: number, rotated: boolean): boolean {
  const { cols, rows } = effectiveDims(getDef(name), rotated);
  if (col + cols > COLS || row + rows > ROWS) return false;
  const occ = buildOccupied(drills);
  for (let r = row; r < row + rows; r++) {
    for (let c = col; c < col + cols; c++) {
      if (occ.has(`${c},${r}`)) return false;
    }
  }
  return true;
}

function getPreviewCells(name: string, rotated: boolean, hoverCell: [number, number] | null): Set<string> {
  if (!hoverCell) return new Set();
  const { cols, rows } = effectiveDims(getDef(name), rotated);
  const [hc, hr] = hoverCell;
  const cells = new Set<string>();
  for (let r = hr; r < hr + rows; r++) {
    for (let c = hc; c < hc + cols; c++) {
      cells.add(`${c},${r}`);
    }
  }
  return cells;
}

function isRotatable(name: string): boolean {
  const def = getDef(name);
  return def.cols !== def.rows;
}

export default function LayoutDesigner() {
  const [layout, setLayout] = useLocalStorage<{ drills: PlacedDrill[] }>("devware_layout2", { drills: [] });
  const [selected, setSelected] = useState<string>("Ruby Drill");
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const [configName, setConfigName] = useLocalStorage("devware_layout_name", "My Layout");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [search, setSearch] = useState("");
  const [manualRotate, setManualRotate] = useState(false);

  const occupied = buildOccupied(layout.drills);
  const selectedRotatable = isRotatable(selected);

  // Auto-rotate: prefer default orientation; only rotate if default doesn't fit but rotated does
  const autoRotated = hoverCell != null && isRotatable(selected)
    ? !canPlace(layout.drills, selected, hoverCell[0], hoverCell[1], false) &&
       canPlace(layout.drills, selected, hoverCell[0], hoverCell[1], true)
    : false;

  const previewRotated = selectedRotatable && manualRotate ? true : autoRotated;
  const preview = getPreviewCells(selected, previewRotated, hoverCell);
  const canDrop = hoverCell ? canPlace(layout.drills, selected, hoverCell[0], hoverCell[1], previewRotated) : false;

  useEffect(() => {
    if (!selectedRotatable && manualRotate) {
      setManualRotate(false);
    }
  }, [manualRotate, selectedRotatable]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedRotatable) return;
      if (event.key.toLowerCase() !== "r") return;

      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }

      event.preventDefault();
      setManualRotate(prev => !prev);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedRotatable]);

  const emptyCells: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!occupied.has(`${c},${r}`)) emptyCells.push([c, r]);
    }
  }

  const handleCellClick = (col: number, row: number) => {
    const drillId = occupied.get(`${col},${row}`);
    if (drillId) {
      setLayout(prev => ({ drills: prev.drills.filter(d => d.id !== drillId) }));
      return;
    }
    const defaultFits = canPlace(layout.drills, selected, col, row, false);
    const rotatedFits = selectedRotatable && canPlace(layout.drills, selected, col, row, true);
    const useRotated = selectedRotatable
      ? (manualRotate ? rotatedFits : !defaultFits && rotatedFits)
      : false;
    if (!canPlace(layout.drills, selected, col, row, useRotated)) return;
    setLayout(prev => ({
      drills: [...prev.drills, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: selected, col, row, rotated: useRotated,
      }],
    }));
  };

  const totalRate = layout.drills.reduce((s, d) => {
    const { pc, pr } = cellPlot(d.col, d.row);
    return s + getDef(d.name).rate * getPlotMultiplier(pc, pr);
  }, 0);
  const totalCells = COLS * ROWS;
  const usedCells = Array.from(occupied.keys()).length;

  const visibleDrills = DRILL_DEFS.filter(d => {
    const sizeMatch =
      sizeFilter === "all" ||
      (sizeFilter === "1x1" && d.cols === 1 && d.rows === 1) ||
      (sizeFilter === "2x1" && d.cols === 2 && d.rows === 1) ||
      (sizeFilter === "2x2" && d.cols === 2 && d.rows === 2);
    const searchMatch = search === "" || d.name.toLowerCase().includes(search.toLowerCase());
    return sizeMatch && searchMatch;
  });

  // Stats: group placed drills by name
  const placedCounts = new Map<string, number>();
  for (const d of layout.drills) {
    placedCounts.set(d.name, (placedCounts.get(d.name) ?? 0) + 1);
  }

  return (
    <div className="space-y-5">

      {/* Config name row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editingName ? (
            <input
              autoFocus
              className="input-dark px-2 py-1 rounded text-sm font-mono w-44"
              value={nameDraft}
              onChange={e => setNameDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { setConfigName(nameDraft || "My Layout"); setEditingName(false); }
                if (e.key === "Escape") setEditingName(false);
              }}
              onBlur={() => { setConfigName(nameDraft || "My Layout"); setEditingName(false); }}
            />
          ) : (
            <button
              onClick={() => { setNameDraft(configName); setEditingName(true); }}
              className="text-sm font-mono font-bold text-red-300 hover:text-red-200 transition-colors"
            >
              {configName} <span className="text-muted-foreground text-xs">✎</span>
            </button>
          )}
          <span className="text-xs text-green-500/70 bg-green-950/30 px-2 py-0.5 rounded-full border border-green-900/30 font-mono">
            saved
          </span>
        </div>
        <button
          onClick={() => setLayout({ drills: [] })}
          className="text-xs text-red-500/60 hover:text-red-400 transition-colors font-mono"
        >
          clear all
        </button>
      </div>

      {/* Palette */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Select Drill</p>

        {/* Filters */}
        <div className="flex gap-2 mb-2 flex-wrap">
          {(["all", "1x1", "2x1", "2x2"] as SizeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setSizeFilter(f)}
              className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-all ${
                sizeFilter === f
                  ? "bg-red-950/60 border-red-600/50 text-red-300"
                  : "bg-black/20 border-white/10 text-muted-foreground hover:border-white/20"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
          <input
            className="input-dark text-xs px-2 py-1 rounded-md w-32 ml-auto"
            placeholder="search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {selectedRotatable && (
            <button
              onClick={() => setManualRotate(prev => !prev)}
              className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-all ${
                manualRotate
                  ? "bg-red-950/60 border-red-600/50 text-red-300"
                  : "bg-black/20 border-white/10 text-muted-foreground hover:border-white/20"
              }`}
            >
              Rotate [R]
            </button>
          )}
        </div>

        {/* Drill list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {visibleDrills.map(def => {
            const isSel = selected === def.name;
            const previewDimsRotated = isSel ? previewRotated : false;
            const { cols: dc, rows: dr } = effectiveDims(def, previewDimsRotated);
            return (
              <button
                key={def.name}
                onClick={() => setSelected(def.name)}
                className={`
                  relative rounded-lg px-2.5 py-2 border text-left transition-all duration-150 flex items-center gap-2.5
                  ${isSel ? `${def.bg} ${def.border}` : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"}
                `}
              >
                {/* Size dots preview */}
                <div
                  className="shrink-0"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${dc}, 8px)`,
                    gridTemplateRows: `repeat(${dr}, 8px)`,
                    gap: '2px',
                  }}
                >
                  {Array.from({ length: dc * dr }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm border ${isSel ? `${def.bg} ${def.border}` : "bg-white/15 border-white/10"}`}
                    />
                  ))}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-mono font-bold leading-tight truncate ${isSel ? def.color : "text-muted-foreground"}`}>
                    {def.short}
                  </div>
                  <div className="text-xs text-muted-foreground/50 font-mono">{formatNumber(def.rate)}/s</div>
                </div>
                {def.drop && (
                  <span className="absolute top-1 right-1 text-[9px] font-mono text-yellow-500/70">drop</span>
                )}
                {isRotatable(def.name) && (
                  <span className="absolute bottom-1 left-1 text-[9px] font-mono text-cyan-400/70">rotatable</span>
                )}
                {isSel && (
                  <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground/40 font-mono">
            Click cell to place · Click placed drill to remove
            {selectedRotatable && (
              <span className="text-muted-foreground/25 ml-1">
                · auto-rotates to fit · press R to rotate manually
              </span>
            )}
          </p>
          {selectedRotatable && (
            <p className={`text-xs font-mono ${manualRotate ? "text-red-300" : "text-muted-foreground/50"}`}>
              Rotation: {manualRotate ? "manual" : "auto"}
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">
          Drill Layout
          <span className="normal-case font-normal text-muted-foreground/50 ml-1">
            12 plots (3×4) · each plot = 30×30 studs · {usedCells}/{totalCells} sub-cells used
          </span>
        </p>

        <div className="overflow-x-auto">
          <div
            className="result-display relative"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
              gap: '2px',
              padding: '8px',
              width: 'fit-content',
            }}
            onMouseLeave={() => setHoverCell(null)}
          >
            {emptyCells.map(([c, r]) => {
              const key = `${c},${r}`;
              const isHov = preview.has(key);
              const isPlotRightEdge = (c + 1) % CELLS_PER_PLOT === 0 && c !== COLS - 1;
              const isPlotBottomEdge = (r + 1) % CELLS_PER_PLOT === 0 && r !== ROWS - 1;
              const { pc, pr } = cellPlot(c, r);
              const mult = getPlotMultiplier(pc, pr);
              const tint =
                pr === 0 ? 'bg-red-950/45' :
                pr === 1 ? 'bg-amber-900/25' :
                'bg-green-950/30';
              const hoverTint =
                pr === 0 ? 'bg-red-900/55 outline outline-1 outline-red-500/60' :
                pr === 1 ? 'bg-amber-800/40 outline outline-1 outline-amber-500/40' :
                'bg-green-900/45 outline outline-1 outline-green-600/50';
              return (
                <div
                  key={`empty-${key}`}
                  style={{
                    gridColumn: c + 1,
                    gridRow: r + 1,
                    boxShadow: [
                      isPlotRightEdge  ? '2px 0 0 0 hsla(0,65%,35%,0.55)' : '',
                      isPlotBottomEdge ? '0 2px 0 0 hsla(0,65%,35%,0.55)' : '',
                      isPlotRightEdge && isPlotBottomEdge ? '2px 2px 0 0 hsla(0,65%,35%,0.55)' : '',
                    ].filter(Boolean).join(', ') || undefined,
                  }}
                  className={`
                    cursor-pointer transition-all duration-100 flex items-center justify-center rounded-sm
                    ${isHov
                      ? canDrop ? hoverTint : 'bg-red-950/20 opacity-40 cursor-not-allowed'
                      : tint
                    }
                  `}
                  onMouseEnter={() => setHoverCell([c, r])}
                  onClick={() => handleCellClick(c, r)}
                >
                  {isHov && canDrop && (
                    <span className="text-white/60 text-base font-mono leading-none">+</span>
                  )}
                </div>
              );
            })}

            {layout.drills.map(drill => {
              const def = getDef(drill.name);
              const { cols, rows } = effectiveDims(def, drill.rotated ?? false);
              const { pc, pr } = cellPlot(drill.col, drill.row);
              const mult = getPlotMultiplier(pc, pr);
              const effectiveRate = def.rate * mult;
              const multColor =
                mult === 5 ? 'text-yellow-300' :
                mult === 3 ? 'text-orange-300' :
                mult === 2 ? 'text-blue-300' : 'text-white/40';
              return (
                <div
                  key={drill.id}
                  style={{
                    gridColumn: `${drill.col + 1} / span ${cols}`,
                    gridRow: `${drill.row + 1} / span ${rows}`,
                  }}
                  title={`${def.name} · base ${formatNumber(def.rate)}/s × ${mult} = ${formatNumber(effectiveRate)}/s · click to remove`}
                  className={`
                    rounded border cursor-pointer transition-all duration-150
                    relative flex flex-col items-center justify-center gap-0.5 group
                    hover:brightness-125 active:scale-95
                    ${def.bg} ${def.border}
                  `}
                  onMouseEnter={() => setHoverCell(null)}
                  onClick={() => setLayout(prev => ({ drills: prev.drills.filter(d => d.id !== drill.id) }))}
                >
                  <div
                    className={`font-bold font-mono leading-tight text-center pointer-events-none ${def.color}`}
                    style={{ fontSize: def.cols >= 2 && def.rows >= 2 ? '11px' : '9px' }}
                  >
                    {def.short}
                  </div>
                  {(cols >= 2 || rows >= 2) && (
                    <div
                      className={`font-mono pointer-events-none ${def.color} opacity-70`}
                      style={{ fontSize: '9px' }}
                    >
                      {formatNumber(effectiveRate)}/s
                    </div>
                  )}
                  {mult > 1 && (
                    <div className={`absolute bottom-0.5 left-0.5 font-mono font-bold pointer-events-none ${multColor}`} style={{ fontSize: '8px' }}>
                      {mult}×
                    </div>
                  )}
                  <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white/50 text-[9px] font-mono">✕</span>
                  </div>
                </div>
              );
            })}

            {/* Plot multiplier overlay badges */}
            {Array.from({ length: 3 }, (_, pc) =>
              Array.from({ length: 4 }, (_, pr) => {
                const mult = getPlotMultiplier(pc, pr);
                if (mult === 1) return null;
                const badgeColor =
                  mult === 5 ? 'text-yellow-400 bg-yellow-950/80 border-yellow-700/60' :
                  mult === 3 ? 'text-orange-400 bg-orange-950/80 border-orange-700/60' :
                               'text-blue-400 bg-blue-950/80 border-blue-700/60';
                return (
                  <div
                    key={`badge-${pc}-${pr}`}
                    className="pointer-events-none"
                    style={{
                      position: 'absolute',
                      left: GRID_PAD + pc * (PLOT_SIZE + 2) + 3,
                      top: GRID_PAD + pr * (PLOT_SIZE + 2) + 3,
                      zIndex: 10,
                    }}
                  >
                    <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded border ${badgeColor}`}>
                      {mult}×
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="result-display p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Layout Stats</p>
          <p className="text-sm font-mono text-red-400 font-bold">{formatNumber(totalRate)}/s total</p>
        </div>
        {placedCounts.size === 0 ? (
          <p className="text-xs text-muted-foreground/30 font-mono text-center py-2">No drills placed yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from(placedCounts.entries()).map(([name, count]) => {
              const def = getDef(name);
              const effContrib = layout.drills
                .filter(d => d.name === name)
                .reduce((s, d) => {
                  const { pc, pr } = cellPlot(d.col, d.row);
                  return s + def.rate * getPlotMultiplier(pc, pr);
                }, 0);
              return (
                <div key={name} className={`rounded-lg p-2.5 border ${def.bg} ${def.border} flex items-center gap-2`}>
                  <span className={`text-sm font-mono font-bold ${def.color}`}>{count}×</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-mono font-bold truncate ${def.color}`}>{def.short}</p>
                    <p className={`text-xs font-mono opacity-60 ${def.color}`}>{formatNumber(effContrib)}/s</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground/30 font-mono">
          {usedCells} / {totalCells} cells used · {layout.drills.length} drills placed
        </p>
      </div>
    </div>
  );
}
