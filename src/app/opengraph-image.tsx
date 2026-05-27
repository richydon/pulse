import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pulse — Your reputation, earned in public. Owned by you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#111827",
          padding: "60px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#134E4A",
            color: "#5EEAD4",
            fontSize: "14px",
            fontFamily: "system-ui, sans-serif",
            padding: "6px 14px",
            borderRadius: "999px",
            marginBottom: "40px",
            width: "fit-content",
          }}
        >
          Built on Arkiv Braga Testnet
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "700",
            color: "#FFFFFF",
            lineHeight: 1.1,
            marginBottom: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          Your reputation,
          <br />
          <span style={{ color: "#60A5FA" }}>owned by you.</span>
        </div>

        {/* Sub copy */}
        <div
          style={{
            fontSize: "24px",
            color: "#9CA3AF",
            fontFamily: "system-ui, sans-serif",
            marginBottom: "56px",
            maxWidth: "680px",
            lineHeight: 1.5,
          }}
        >
          Every contribution at Network School becomes a tamper-proof, wallet-owned record on Arkiv.
        </div>

        {/* Pillar pills */}
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { label: "Learn", color: "#3B82F6", bg: "#1E3A5F" },
            { label: "Burn", color: "#F97316", bg: "#431407" },
            { label: "Earn", color: "#10B981", bg: "#064E3B" },
            { label: "Fun", color: "#A78BFA", bg: "#2E1065" },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                backgroundColor: p.bg,
                color: p.color,
                fontSize: "16px",
                fontFamily: "system-ui, sans-serif",
                fontWeight: "600",
                padding: "8px 20px",
                borderRadius: "999px",
              }}
            >
              {p.label}
            </div>
          ))}
        </div>

        {/* Bottom wordmark */}
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            right: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <div style={{ fontSize: "36px", fontWeight: "700", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            Pulse
          </div>
          <div style={{ fontSize: "14px", color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>
            ETHns × Arkiv Challenge 2026
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
