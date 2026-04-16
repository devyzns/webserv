import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseAmount, formatNumber } from "@/lib/parsers";

export default function GasPriceWidget() {
  const [gasPrice, setGasPrice] = useLocalStorage("devware_gas_price", "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const parsed = parseAmount(gasPrice);

  const startEdit = () => {
    setDraft(gasPrice);
    setEditing(true);
  };

  const save = () => {
    if (draft.trim()) setGasPrice(draft.trim());
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="card-glass rounded-xl p-4 flex items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-base shrink-0">
          ⛽
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">How much you'd like to sell for</p>
          {editing ? (
            <input
              autoFocus
              className="input-dark px-2 py-1 rounded text-sm font-mono w-36 mt-0.5"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKey}
              onBlur={save}
              placeholder="e.g. 2, 1.5k"
            />
          ) : (
            <button
              onClick={startEdit}
              className="text-left group"
            >
              {parsed !== null ? (
                <span className="text-xl font-bold font-mono text-red-400 text-glow-red group-hover:text-red-300 transition-colors">
                  {formatNumber(parsed)}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors font-mono">
                  Click to set price...
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      {parsed !== null && !editing && (
        <div className="text-right">
          <p className="text-xs text-muted-foreground">per unit</p>
          <button
            onClick={startEdit}
            className="text-xs text-red-500/60 hover:text-red-400 transition-colors font-mono mt-0.5"
          >
            edit
          </button>
        </div>
      )}
    </div>
  );
}
