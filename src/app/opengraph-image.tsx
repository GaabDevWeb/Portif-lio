import { ImageResponse } from "next/og";

import { loadSiteConfig } from "@/lib/content/site";

export const runtime = "edge";
export const alt = "ROOT OS — personal kernel space";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const site = loadSiteConfig();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a120a",
          padding: 64,
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#c9a227",
            }}
          />
          <span style={{ color: "#6b8f6b", fontSize: 24 }}>{site.name} 0.1.0</span>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#7fd47f",
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          {site.name}
        </div>
        <div style={{ fontSize: 32, color: "#9fd49f", marginTop: 16 }}>
          {site.tagline}
        </div>
        <div
          style={{
            marginTop: 48,
            padding: "16px 24px",
            border: "1px solid #2a3a2a",
            borderRadius: 4,
            color: "#7fd47f",
            fontSize: 22,
          }}
        >
          guest@devbox:~$ whoami
        </div>
      </div>
    ),
    { ...size },
  );
}
