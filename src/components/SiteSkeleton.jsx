import { useEffect, useState } from "react";

/**
 * Скелетон главного сайта.
 * Повторяет nav + hero, чтобы не было layout-shift при появлении реального контента.
 * Тема — auto (по времени суток + prefers-color-scheme), как в Site.jsx.
 */
export default function SiteSkeleton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 7;
    const sys = window.matchMedia?.("(prefers-color-scheme: dark)");
    setDark(isNight || (sys?.matches ?? false));
  }, []);

  const bg     = dark ? "#0f0f0f" : "#ffffff";
  const bg2    = dark ? "#1a1a1a" : "#f7f6f3";
  const tone1  = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tone2  = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const Bone = ({ w, h, r = 6, style }) => (
    <div className="sk-bone" style={{
      width: w, height: h, borderRadius: r,
      background: `linear-gradient(90deg, ${tone1} 0%, ${tone2} 50%, ${tone1} 100%)`,
      backgroundSize: "200% 100%",
      ...style,
    }} />
  );

  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes sk-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .sk-bone { animation: sk-shimmer 1.6s linear infinite; }
        @media (max-width: 640px) {
          .sk-hero { flex-direction: column !important; }
          .sk-stats { grid-template-columns: 1fr 1fr !important; width: 100% !important; }
        }
      `}</style>

      {/* nav */}
      <div style={{
        height: 56, borderBottom: `0.5px solid ${border}`, background: bg,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box",
      }}>
        <Bone w={160} h={18} />
        <div style={{ display: "flex", gap: 12 }}>
          <Bone w={50} h={14} />
          <Bone w={60} h={14} />
          <Bone w={50} h={14} />
          <Bone w={70} h={14} />
        </div>
      </div>

      {/* hero */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 40px" }}>
        <div className="sk-hero" style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Bone w={84} h={84} r="50%" style={{ marginBottom: 28 }} />
            <Bone w="70%" h={44} style={{ marginBottom: 14 }} />
            <Bone w="40%" h={20} style={{ marginBottom: 28 }} />
            <Bone w="90%" h={14} style={{ marginBottom: 8 }} />
            <Bone w="80%" h={14} style={{ marginBottom: 8 }} />
            <Bone w="55%" h={14} style={{ marginBottom: 36 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <Bone w={140} h={40} r={8} />
              <Bone w={110} h={40} r={8} />
            </div>
          </div>
          <div className="sk-stats" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
            width: 320, flexShrink: 0,
          }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                background: bg2, borderRadius: 12, padding: "20px 24px",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <Bone w={50} h={28} />
                <Bone w={90} h={11} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
