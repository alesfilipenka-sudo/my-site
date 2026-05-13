import { AnalyticalDot, Tag } from "../lib/projectAssets.jsx";
import { PROJECT_ICONS } from "../lib/projectIcons.js";

/**
 * Карточка проекта. Используется и в Site.jsx (компонент Projects, 3 колонки),
 * и в ProjectsPage.jsx (страница архива, 2 колонки). Вёрстка одинаковая.
 */
export default function ProjectCard({ T, p, idx = 0 }) {
  const companyAccent = (c) => {
    if (/self/i.test(c))     return { color: T.text, bg: T.surface,                 border: T.borderHi };
    if (/vibecode/i.test(c)) return { color: T.acc,  bg: `rgba(${T.accGlow},0.08)`, border: `rgba(${T.accGlow},0.35)` };
    return { color: T.text, bg: T.surface, border: T.borderHi };
  };
  const statusMeta = (s) => s === "ready"
    ? { label: "Ready",          dotColor: T.ok,  tint: T.ok }
    : { label: "In development", dotColor: T.acc, tint: T.acc };

  const sm = statusMeta(p.status);
  const co = companyAccent(p.company);
  const iconPath = PROJECT_ICONS[p.icon] || PROJECT_ICONS.globe;
  const uid = p.id ?? idx;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: T.bg2, border: `0.5px solid ${T.border}`, borderRadius: 12,
      overflow: "hidden", height: "100%", transition: "border-color 0.25s, transform 0.25s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHi; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;   e.currentTarget.style.transform = "translateY(0)"; }}>

      {/* Image / placeholder */}
      <div style={{
        position: "relative", aspectRatio: "16 / 10",
        background: p.image ? `url(${p.image}) center/cover` : `linear-gradient(135deg, ${T.surface} 0%, ${T.bg} 100%)`,
        borderBottom: `0.5px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {!p.image && (
          <>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
              <defs>
                <pattern id={`pgrid-${uid}`} width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke={T.border} strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#pgrid-${uid})`} />
            </svg>
            <div style={{
              position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: 12,
              background: T.bg2, border: `0.5px solid ${T.borderHi}`,
              boxShadow: `0 0 0 6px ${T.surface}, 0 0 32px rgba(${T.accGlow},0.18)`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={T.acc} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={iconPath} />
              </svg>
            </div>
            {p.placeholder && (
              <span style={{
                position: "absolute", bottom: 10, left: 12,
                fontFamily: "var(--mono)", fontSize: 9.5, color: T.textTer,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>↳ {p.placeholder}</span>
            )}
          </>
        )}
        <span style={{
          position: "absolute", top: 12, right: 14,
          fontFamily: "var(--mono)", fontSize: 10,
          color: p.image ? "#fff" : T.textTer, letterSpacing: "0.08em",
          textShadow: p.image ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
        }}>/{String(idx + 1).padStart(2, "0")}</span>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: "var(--mono)", fontSize: 10, color: sm.tint,
            padding: "3px 8px",
            background: `rgba(${T.accGlow},${p.status === "ready" ? 0 : 0.06})`,
            border: `0.5px solid ${sm.tint === T.ok ? "rgba(132,210,168,0.35)" : `rgba(${T.accGlow},0.35)`}`,
            borderRadius: 3, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            <AnalyticalDot size={5} color={sm.dotColor} pulse={p.status !== "ready"} />
            {sm.label}
          </span>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10.5, color: T.textTer,
            letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
          }}>
            {p.status === "ready" ? "Shipped" : "ETA"} · {p.date}
          </span>
        </div>

        <h3 style={{
          fontSize: 17, fontWeight: 500, color: T.text,
          margin: 0, letterSpacing: "-0.01em", lineHeight: 1.25,
        }}>{p.title}</h3>

        <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, margin: 0, flex: 1 }}>
          {p.desc}
        </p>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto",
          paddingTop: 12, borderTop: `0.5px dashed ${T.border}`,
        }}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9.5,
            padding: "3px 7px", borderRadius: 3, letterSpacing: "0.06em", textTransform: "uppercase",
            color: co.color, background: co.bg, border: `0.5px solid ${co.border}`,
          }}>{p.company}</span>
          {p.domain && <Tag T={T} accent>{p.domain}</Tag>}
        </div>
      </div>
    </div>
  );
}
