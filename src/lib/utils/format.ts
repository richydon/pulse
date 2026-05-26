export function truncateHex(hex: string, start = 6, end = 4): string {
  if (!hex || hex.length <= start + end + 2) return hex;
  return `${hex.slice(0, start)}...${hex.slice(-end)}`;
}

export function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCountdown(ts: number): string {
  const diff = ts * 1000 - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function parseEntityPayload(entity: any): any {
  try {
    if (!entity) return {};
    if (typeof entity.toText === "function") return JSON.parse(entity.toText());
    if (entity.payload instanceof Uint8Array)
      return JSON.parse(new TextDecoder().decode(entity.payload));
    if (entity.payload && typeof entity.payload === "object" && !ArrayBuffer.isView(entity.payload))
      return entity.payload;
    return {};
  } catch {
    return {};
  }
}

export function walletToColor(wallet: string): string {
  const colors = [
    "#3B82F6", "#F97316", "#10B981", "#8B5CF6",
    "#EC4899", "#F59E0B", "#06B6D4", "#EF4444",
  ];
  const idx = parseInt(wallet.slice(-4), 16) % colors.length;
  return colors[idx];
}
