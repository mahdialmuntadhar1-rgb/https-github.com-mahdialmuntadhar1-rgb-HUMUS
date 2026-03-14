import { useEffect, useState } from "react";

type CrawlerStatus = {
  activeAgents: number;
  queuedTiles: number;
  completedTiles: number;
  businessesDiscoveredToday: number;
  duplicateRate: number;
  errors: number;
};

type Tile = { id: string; governorate: string; city: string; lat: number; lng: number; status: string; priority: number };

export function CrawlerMonitorPanels() {
  const [status, setStatus] = useState<CrawlerStatus | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const [statusResponse, tileResponse] = await Promise.all([
        fetch("/api/agents/status"),
        fetch("/api/crawler/tiles"),
      ]);

      if (statusResponse.ok) setStatus(await statusResponse.json());
      if (tileResponse.ok) setTiles(await tileResponse.json());
    };

    fetchDashboard().catch(console.error);
  }, []);

  const tilesByStatus = tiles.reduce<Record<string, number>>((acc, tile) => {
    acc[tile.status] = (acc[tile.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
      <div style={{ padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1, marginBottom: 10 }}>Crawler Monitor</h3>
        <div style={{ display: "grid", gap: 6, fontSize: 11 }}>
          <span>Active agents: {status?.activeAgents ?? "--"}</span>
          <span>Queued tiles: {status?.queuedTiles ?? "--"}</span>
          <span>Completed tiles: {status?.completedTiles ?? "--"}</span>
          <span>Discovered today: {status?.businessesDiscoveredToday ?? "--"}</span>
          <span>Duplicate rate: {status ? `${Math.round(status.duplicateRate * 100)}%` : "--"}</span>
          <span>Errors: {status?.errors ?? "--"}</span>
        </div>
      </div>

      <div style={{ padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1, marginBottom: 10 }}>Tile Coverage Map</h3>
        <div style={{ maxHeight: 180, overflowY: "auto", fontSize: 10, display: "grid", gap: 4 }}>
          {tiles.slice(0, 20).map((tile) => (
            <div key={tile.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <span>{tile.governorate} / {tile.city}</span>
              <span style={{ color: tile.status === "completed" ? "#22c55e" : "#f59e0b" }}>{tile.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1, marginBottom: 10 }}>Agent Performance</h3>
        <div style={{ display: "grid", gap: 6, fontSize: 11 }}>
          {Object.entries(tilesByStatus).map(([state, total]) => (
            <span key={state}>{state}: {total}</span>
          ))}
          {Object.entries(tilesByStatus).length === 0 && <span>No tile metrics yet</span>}
        </div>
      </div>
    </div>
  );
}
