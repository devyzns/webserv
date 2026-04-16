import { useState, useRef } from "react";
import { parseAmount, parsePercent, formatNumber } from "@/lib/parsers";

interface Result {
  total: number;
  breakdown: {
    amount: number;
    price: number;
    boost: number;
  };
}

export default function SellGasCalc() {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [boost, setBoost] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [animated, setAnimated] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const calculate = () => {
    setError("");
    const parsedAmount = parseAmount(amount);
    const parsedPrice = parseAmount(price);
    const parsedBoost = parsePercent(boost);

    if (parsedAmount === null) { setError("Invalid amount. Try: 1m, 500k, 2.5b"); return; }
    if (parsedPrice === null) { setError("Invalid price. Try: 2, 1.5"); return; }
    if (parsedBoost === null) { setError("Invalid boost. Try: 20%, 0.20"); return; }

    const total = parsedAmount * parsedPrice * (1 + parsedBoost);
    setResult({ total, breakdown: { amount: parsedAmount, price: parsedPrice, boost: parsedBoost } });
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
          Calculate earnings from selling gas. Formula: <span className="font-mono text-red-400">Total = Amount × Price × (1 + Boost)</span>
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Gas Amount</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 1m, 500k, 2.5b"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={handleKey}
          />
          {amount && parseAmount(amount) !== null && (
            <p className="text-xs text-muted-foreground font-mono pl-1">
              → {parseAmount(amount)!.toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Price per Unit</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 2, 1.5"
            value={price}
            onChange={e => setPrice(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-red-300/80 uppercase tracking-wider">Boost</label>
          <input
            className="input-dark w-full px-4 py-3 rounded-lg font-mono text-sm"
            placeholder="e.g. 20%, 0.20"
            value={boost}
            onChange={e => setBoost(e.target.value)}
            onKeyDown={handleKey}
          />
          {boost && parsePercent(boost) !== null && (
            <p className="text-xs text-muted-foreground font-mono pl-1">
              → {(parsePercent(boost)! * 100).toFixed(1)}% boost
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
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Earnings</p>
            <p className={`text-4xl font-bold text-glow-red text-red-400 font-mono ${animated ? 'animate-number-pop' : ''}`}>
              {formatNumber(result.total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{result.total.toLocaleString()}</p>
          </div>
          <div className="border-t border-red-900/30 pt-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Breakdown</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.breakdown.amount)}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-sm font-mono text-red-300">{formatNumber(result.breakdown.price)}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Boost</p>
                <p className="text-sm font-mono text-red-300">+{(result.breakdown.boost * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-muted-foreground font-mono opacity-60">
              {formatNumber(result.breakdown.amount)} × {result.breakdown.price} × (1 + {(result.breakdown.boost * 100).toFixed(1)}%) = {formatNumber(result.total)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
