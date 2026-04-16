import { useState } from "react";
import { parseAmount, parsePercent, formatNumber, formatSeconds } from "@/lib/parsers";

interface Result {
  seconds: number;
  target: number;
  rate: number;
  boost: number;
  effectiveRate: number;
}

export default function TimeToOilCalc() {
  const [target, setTarget] = useState("");
  const [rate, setRate] = useState("");
  const [boost, setBoost] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [animated, setAnimated] = useState(false);

  const calculate = () => {
    setError("");
    const parsedTarget = parseAmount(target);
    const parsedRate = parseAmount(rate);
    const parsedBoost = boost.trim() ? parsePercent(boost) : 0;

    if (parsedTarget === null) { setError("Invalid target. Try: 1m, 500k, 2.5b"); return; }
    if (parsedRate === null) { setError("Invalid rate. Try: 100, 1k, 500"); return; }
    if (parsedBoost === null) { setError("Invalid boost. Try: 20%, 0.20, or leave blank"); return; }

    const effectiveRate = parsedRate * (1 + parsedBoost);
    if (effectiveRate <= 0) { setError("Rate must be greater than 0"); return; }

    const seconds = parsedTarget / effectiveRate;
    setResult({ seconds, target: parsedTarget, rate: parsedRate, boost: parsedBoost, effectiveRate });
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
          How long until you reach a target. Formula: <span className="font-mono text-red-400">Time = Target / (Rate × (1 + Boost))</span>
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Target Oil</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 1m, 500k, 2.5b"
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={handleKey}
          />
          {target && parseAmount(target) !== null && (
            <p className="text-xs text-muted-foreground font-mono pl-1">
              → {parseAmount(target)!.toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Rate (per second)</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 100, 1k, 500"
            value={rate}
            onChange={e => setRate(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Boost <span className="text-muted-foreground normal-case font-normal">(optional)</span></label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 20%, 0.20 (optional)"
            value={boost}
            onChange={e => setBoost(e.target.value)}
            onKeyDown={handleKey}
          />
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
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Time Required</p>
            <p className={`text-4xl font-bold text-glow-red text-red-400 font-mono ${animated ? 'animate-number-pop' : ''}`}>
              {formatSeconds(result.seconds)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{result.seconds.toLocaleString(undefined, { maximumFractionDigits: 1 })} seconds</p>
          </div>
          <div className="border-t border-red-900/30 pt-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Breakdown</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.target)}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Base Rate</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.rate)}/s</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Effective Rate</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.effectiveRate)}/s</p>
              </div>
            </div>
            {result.boost > 0 && (
              <div className="mt-2 text-center text-xs text-muted-foreground font-mono opacity-60">
                {formatNumber(result.target)} / ({formatNumber(result.rate)} × {(1 + result.boost).toFixed(2)}) = {formatSeconds(result.seconds)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
