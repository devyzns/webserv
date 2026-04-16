import { useState } from "react";
import { parseAmount, parsePercent, formatNumber, formatSeconds } from "@/lib/parsers";

interface Result {
  seconds: number;
  cost: number;
  rate: number;
  boost: number;
  drillMultiplier: number;
  effectiveRate: number;
}

export default function BuyTimeCalc() {
  const [cost, setCost] = useState("");
  const [rate, setRate] = useState("");
  const [boost, setBoost] = useState("");
  const [drillMult, setDrillMult] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [animated, setAnimated] = useState(false);

  const calculate = () => {
    setError("");
    const parsedCost = parseAmount(cost);
    const parsedRate = parseAmount(rate);
    const parsedBoost = boost.trim() ? parsePercent(boost) : 0;
    const parsedDrill = drillMult.trim() ? parseAmount(drillMult) : 1;

    if (parsedCost === null) { setError("Invalid cost. Try: 1m, 500k, 2.5b"); return; }
    if (parsedRate === null) { setError("Invalid rate. Try: 100, 1k, 500"); return; }
    if (parsedBoost === null) { setError("Invalid boost. Try: 20%, 0.20 or leave blank"); return; }
    if (parsedDrill === null || parsedDrill <= 0) { setError("Invalid drill multiplier. Try: 1, 2, 1.5"); return; }

    const effectiveRate = parsedRate * (1 + parsedBoost) * parsedDrill;
    if (effectiveRate <= 0) { setError("Effective production rate must be greater than 0"); return; }

    const seconds = parsedCost / effectiveRate;
    setResult({
      seconds,
      cost: parsedCost,
      rate: parsedRate,
      boost: parsedBoost,
      drillMultiplier: parsedDrill,
      effectiveRate,
    });
    setAnimated(false);
    requestAnimationFrame(() => setAnimated(true));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") calculate();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Time to afford a purchase. Formula: <span className="font-mono text-red-400">Time = Cost / (Rate × (1 + Boost) × Drill)</span>
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Item Cost</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 1m, 500k, 2.5b"
            value={cost}
            onChange={e => setCost(e.target.value)}
            onKeyDown={handleKey}
          />
          {cost && parseAmount(cost) !== null && (
            <p className="text-xs text-muted-foreground font-mono pl-1">
              → {parseAmount(cost)!.toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Production Rate (per second)</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 100, 1k, 500"
            value={rate}
            onChange={e => setRate(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Boost <span className="text-muted-foreground normal-case font-normal text-xs">(opt)</span></label>
            <input
              className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
              placeholder="e.g. 20%"
              value={boost}
              onChange={e => setBoost(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Drill Mult <span className="text-muted-foreground normal-case font-normal text-xs">(opt)</span></label>
            <input
              className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
              placeholder="e.g. 1, 2, 1.5"
              value={drillMult}
              onChange={e => setDrillMult(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3 animate-fade-in">
          {error}
        </div>
      )}

      <button
        onClick={calculate}
        className="btn-primary w-full py-3.5 rounded-lg font-semibold text-sm tracking-wide uppercase"
      >
        Calculate
      </button>

      {result && (
        <div className={`result-display p-5 space-y-4 ${animated ? 'animate-slide-up' : ''}`}>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Time to Afford</p>
            <p className={`text-4xl font-bold text-glow-red text-red-400 font-mono ${animated ? 'animate-number-pop' : ''}`}>
              {formatSeconds(result.seconds)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{result.seconds.toLocaleString(undefined, { maximumFractionDigits: 1 })} seconds</p>
          </div>
          <div className="border-t border-red-900/30 pt-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Breakdown</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.cost)}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Base Rate</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.rate)}/s</p>
              </div>
              {result.boost > 0 && (
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Boost</p>
                  <p className="text-sm font-mono text-red-300">+{(result.boost * 100).toFixed(1)}%</p>
                </div>
              )}
              {result.drillMultiplier !== 1 && (
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Drill Mult</p>
                  <p className="text-sm font-mono text-red-300">×{result.drillMultiplier}</p>
                </div>
              )}
              <div className="bg-black/30 rounded-lg p-3 text-center col-span-2">
                <p className="text-xs text-muted-foreground">Effective Rate</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.effectiveRate)}/sec</p>
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground font-mono opacity-60">
              {formatNumber(result.cost)} / {formatNumber(result.effectiveRate)}/s = {formatSeconds(result.seconds)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
