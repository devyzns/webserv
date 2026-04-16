import { useState, useRef } from "react";
import { parseAmount, parseTime, formatNumber, formatSeconds } from "@/lib/parsers";

interface Result {
  totalOil: number;
  rate: number;
  seconds: number;
}

export default function OilEarningsCalc() {
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [animated, setAnimated] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const calculate = () => {
    setError("");
    const parsedRate = parseAmount(rate);
    const parsedTime = parseTime(time);

    if (parsedRate === null) { setError("Invalid rate. Try: 10, 500, 2.5k"); return; }
    if (parsedTime === null) { setError("Invalid time. Try: 1h, 30m, 1h 30m, 3600"); return; }

    const totalOil = parsedRate * parsedTime;
    setResult({ totalOil, rate: parsedRate, seconds: parsedTime });
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
          Calculate oil generated over time. Formula: <span className="font-mono text-red-400">Total Oil = Rate × Time</span>
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Oil per Second</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 10, 500, 2.5k"
            value={rate}
            onChange={e => setRate(e.target.value)}
            onKeyDown={handleKey}
          />
          {rate && parseAmount(rate) !== null && (
            <p className="text-xs text-muted-foreground font-mono pl-1">
              → {parseAmount(rate)!.toLocaleString()} oil/sec
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Time Duration</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 1h, 30m, 1h 30m, 3600"
            value={time}
            onChange={e => setTime(e.target.value)}
            onKeyDown={handleKey}
          />
          {time && parseTime(time) !== null && (
            <p className="text-xs text-muted-foreground font-mono pl-1">
              → {parseTime(time)!.toLocaleString()} seconds ({formatSeconds(parseTime(time)!)})
            </p>
          )}
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
        <div ref={resultRef} className={`result-display p-5 space-y-4 ${animated ? 'animate-slide-up' : ''}`}>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Oil Generated</p>
            <p className={`text-4xl font-bold text-glow-red text-red-400 font-mono ${animated ? 'animate-number-pop' : ''}`}>
              {formatNumber(result.totalOil)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{result.totalOil.toLocaleString()}</p>
          </div>
          <div className="border-t border-red-900/30 pt-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Breakdown</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.rate)}/sec</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-mono text-red-300">{formatSeconds(result.seconds)}</p>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-muted-foreground font-mono opacity-60">
              {formatNumber(result.rate)}/sec × {result.seconds.toLocaleString()}s = {formatNumber(result.totalOil)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
