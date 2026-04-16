export function parseAmount(input: string): number | null {
  const cleaned = input.trim().toLowerCase().replace(/,/g, '');
  if (!cleaned) return null;

  const suffixes: Record<string, number> = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
    t: 1_000_000_000_000,
  };

  const match = cleaned.match(/^([\d.]+)\s*([kmbt]?)$/);
  if (!match) return null;

  const num = parseFloat(match[1]);
  if (isNaN(num)) return null;

  const suffix = match[2] as keyof typeof suffixes;
  return suffix ? num * suffixes[suffix] : num;
}

export function parsePercent(input: string): number | null {
  const cleaned = input.trim().replace(/%/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num / 100;
}

export function parseTime(input: string): number | null {
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return null;

  let totalSeconds = 0;
  let found = false;

  const patterns: [RegExp, number][] = [
    [/(\d+(?:\.\d+)?)\s*d(?:ay)?s?/i, 86400],
    [/(\d+(?:\.\d+)?)\s*h(?:r|our)?s?/i, 3600],
    [/(\d+(?:\.\d+)?)\s*m(?:in|in)?s?/i, 60],
    [/(\d+(?:\.\d+)?)\s*s(?:ec|ec)?s?/i, 1],
  ];

  for (const [regex, multiplier] of patterns) {
    const match = cleaned.match(regex);
    if (match) {
      totalSeconds += parseFloat(match[1]) * multiplier;
      found = true;
    }
  }

  if (!found) {
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return num;
    return null;
  }

  return totalSeconds;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'T';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K';
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}
