import { useState, useEffect, useRef } from "react";

const iconPath = (t) => ({
  doc: "M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 0v4h4M8 13h8M8 17h5",
  sys: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  fig: "M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zM12 2h3.5a3.5 3.5 0 010 7H12V2zM12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 01-7 0zM5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z",
  ai: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  ppl: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6L6 18M6 6l12 12",
})[t] || "";

function Icon({ type, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPath(type)} />
    </svg>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

const NAV = ["About", "Expertise", "Cases", "Experience", "Contact"];
const BLUE      = "#185FA5";
const BLUE_LT   = "#0C447C";
const BLUE_BG_D = "#042C53";
const BLUE_BG_L = "#E6F1FB";
const BLUE_BD_D = "#185FA5";
const BLUE_BD_L = "#85B7EB";
const GREEN     = "#1D9E75";
const GREEN_D   = "#04342C";
const GREEN_L   = "#E1F5EE";
const GREEN_BD_D = "#0F6E56";
const GREEN_BD_L = "#5DCAA5";
const ACCENT_D  = "#378ADD";
const ACCENT_L  = "#185FA5";

const FLOW_STEPS = [
  { label: "Discovery",    points: ["Stakeholder interviews", "Business context analysis", "Problem framing", "Scope definition"] },
  { label: "Requirements", points: ["User stories & use cases", "V&S, SRS, BRD artifacts", "Prototypes in Figma", "Acceptance criteria"] },
  { label: "Delivery",     points: ["Dev team support", "Change management", "Testing & validation", "Demo presentations"] },
  { label: "Support",      points: ["Post-release monitoring", "Backlog refinement", "Stakeholder sync", "Knowledge base"] },
];

function StatIcon({ index, acc }) {
  const s = { position: "absolute", right: 12, bottom: 10, opacity: 0, transition: "opacity 0.3s", pointerEvents: "none" };
  if (index === 3) {
    return (
      <svg className="stat-icon" style={s} width="56" height="56" viewBox="0 0 56 56">
        <text x="4" y="50" fontSize="56" fontWeight="300" fill="none"
          stroke={acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          fontFamily="system-ui, sans-serif">&</text>
      </svg>
    );
  }
  const paths = [
    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    "M14.5 2.5a5 5 0 00-5 5c0 .96.27 1.85.74 2.6L2.5 18a2 2 0 002.83 2.83L13 13.26A5 5 0 1014.5 2.5zM14.5 10a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  ];
  return (
    <svg className="stat-icon" style={s} width="56" height="56" viewBox="0 0 24 24" fill="none"
      stroke={acc} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[index]} />
    </svg>
  );
}

function FlowDivider({ acc, border, textSec, d }) {
  const [active, setActive] = useState(null);
  return (
    <div style={{ padding: "24px 0", borderBottom: `0.5px solid ${border}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        {FLOW_STEPS.map((step, i) => (
          <div key={step.label} style={{ display: "flex", flex: 1, alignItems: "flex-start", minWidth: 0 }}>
            <div
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{
                flex: 1, minWidth: 0, cursor: "default", overflow: "hidden",
                border: `0.8px solid ${active === i ? acc : (d ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)")}`,
                borderRadius: 8,
                background: active === i ? (d ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)") : "transparent",
                transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                boxShadow: active === i ? `0 0 20px ${d ? "rgba(56,139,237,0.32)" : "rgba(56,139,237,0.18)"}` : "none",
              }}
            >
              <div style={{ height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{
                  fontSize: 13, letterSpacing: "0.04em", color: acc,
                  opacity: active === i ? (d ? 0.9 : 0.85) : (d ? 0.55 : 0.5),
                  transition: "opacity 0.2s",
                }}>{step.label}</span>
              </div>
              <div style={{ overflow: "hidden", maxHeight: active === i ? 200 : 0, opacity: active === i ? 1 : 0, transition: "max-height 0.3s ease, opacity 0.25s ease" }}>
                <div style={{ height: "0.5px", background: acc, opacity: 0.2, margin: "0 20px 14px" }} />
                <div style={{ padding: "0 24px 18px 24px" }}>
                  {step.points.map(p => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                      <span style={{ width: 4, height: 1, background: acc, opacity: 0.4, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: 14, color: textSec, lineHeight: 1.7 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {i < 3 && (
              <div style={{ width: 28, flexShrink: 0, height: 42, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                {[0.25, 0.4, 0.6].map((op, j) => (
                  <svg key={j} width="8" height="12" viewBox="0 0 10 14" fill="none">
                    <path d="M2 2L8 7L2 12" stroke={acc} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity={d ? op + 0.1 : op} />
                  </svg>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Site() {
  const [data, setData] = useState(null);
  const [dark, setDark] = useState(false);
  const [openCase, setOpenCase] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [nodeGlow, setNodeGlow] = useState(false);

  useEffect(() => { fetch("/content.json").then(r => r.json()).then(setData); }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 7;
    const sys = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(isNight || sys.matches);
  }, []);

  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 20);
      setNodeGlow(window.scrollY > 60);
    };
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = id => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  if (!data) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading...</div>;

  const d = dark;
  const bg      = d ? "#0f0f0f" : "#ffffff";
  const bg2     = d ? "#1a1a1a" : "#f7f6f3";
  const bg3     = d ? "#222"    : "#f0efe9";
  const text    = d ? "#e8e6de" : "#1a1a1a";
  const textSec = d ? "#888780" : "#6b6a64";
  const textTer = d ? "#555350" : "#9a9890";
  const border  = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const borderMd= d ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const acc     = d ? ACCENT_D : ACCENT_L;
  const GLOW    = "rgba(56,139,237,0.18)";
  const GLOW_HV = "rgba(56,139,237,0.32)";
  const GLOW_BD = "rgba(56,139,237,0.35)";

  // node graph colors — animate on scroll
  const nodeStroke  = nodeGlow ? acc         : (d ? "#888" : "#bbb");
  const nodeFill    = nodeGlow ? acc         : (d ? "#666" : "#aaa");
  const lineOp  = (base) => nodeGlow ? Math.min(base * 2.2, 0.65) : base;
  const circOp  = (base) => nodeGlow ? Math.min(base * 1.8, 0.7)  : base;

  const badgeBlueText = d ? BLUE    : BLUE_LT;
  const badgeBlueBg   = d ? BLUE_BG_D : BLUE_BG_L;
  const badgeBlueBd   = d ? BLUE_BD_D : BLUE_BD_L;
  const badgeGrText   = d ? GREEN   : "#085041";
  const badgeGrBg     = d ? GREEN_D : GREEN_L;
  const badgeGrBd     = d ? GREEN_BD_D : GREEN_BD_L;

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${bg}; }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .hero-name  { animation: fadeUp 0.7s ease forwards; }
    .hero-role  { animation: fadeUp 0.7s ease 0.1s both; }
    .hero-tag   { animation: fadeUp 0.7s ease 0.18s both; }
    .hero-cta   { animation: fadeUp 0.7s ease 0.26s both; }
    .hero-stats { animation: fadeUp 0.7s ease 0.32s both; }
    .nav-link:hover { color: ${text} !important; }
    .exp-row:hover  { background: ${bg3} !important; }
    .case-btn:hover { background: ${bg2} !important; }
    .exp-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
    .exp-card:hover { border-color: ${GLOW_BD} !important; transform: translateY(-2px); box-shadow: 0 0 18px ${GLOW_HV}; }
    .logo { transition: color 0.2s; }
    .logo:hover .logo-acc { color: ${acc} !important; }
    .logo:hover .logo-at  { color: ${GREEN} !important; }
    .logo-at { color: ${textTer}; transition: color 0.2s; }
    .glow-stat { transition: box-shadow 0.2s; }
    .glow-stat:hover { box-shadow: 0 0 20px ${GLOW_HV}; }
    .glow-stat:hover .stat-icon { opacity: ${d ? "0.14" : "0.09"} !important; }
    .glow-case { transition: box-shadow 0.2s, border-color 0.2s; box-shadow: 0 0 8px ${GLOW}; }
    .glow-case:hover { box-shadow: 0 0 22px ${GLOW_HV}; border-color: ${GLOW_BD} !important; }
    .glow-btn { transition: box-shadow 0.2s; }
    .glow-btn:hover { box-shadow: 0 0 16px ${GLOW_HV}; }
    .exp-card { overflow: visible !important; }
    .more-socials:hover .more-dropdown { max-width: 220px !important; opacity: 1 !important; }
    .more-socials:hover .more-trigger { color: ${text} !important; }
    .node-el { transition: stroke 1s ease, fill 1s ease, opacity 1s ease; }
    @media (max-width: 640px) {
      .hero-grid  { flex-direction: column !important; }
      .about-grid { grid-template-columns: 1fr !important; }
      .exp-grid   { grid-template-columns: 1fr 1fr !important; }
      .case-cols  { grid-template-columns: 1fr !important; }
      .nav-desktop    { display: none !important; }
      .nav-mobile-btn { display: flex !important; }
      .big { font-size: 32px !important; }
    }
    @media (min-width: 641px) {
      .nav-mobile-btn { display: none !important; }
      .mobile-menu    { display: none !important; }
    }
  `;

  const sectionStyle = { padding: "100px 0", borderBottom: `0.5px solid ${border}` };
  const labelStyle   = { fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: textTer, marginBottom: 14 };
  const h2Style      = { fontSize: 36, fontWeight: 500, marginBottom: 48, lineHeight: 1.15, color: text };

  function Tag({ children, accent }) {
    return (
      <span style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, letterSpacing: "0.02em",
        background: accent ? badgeBlueBg : (d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"),
        color: accent ? badgeBlueText : (d ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)"),
        border: accent ? `0.5px solid ${badgeBlueBd}` : `0.5px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      }}>{children}</span>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", color: text, background: bg, lineHeight: 1.6, fontSize: 15, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? (d ? "rgba(15,15,15,0.92)" : "rgba(255,255,255,0.92)") : bg,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: `0.5px solid ${scrolled ? border : "transparent"}`,
        boxShadow: scrolled ? `0 1px 20px ${GLOW}` : "none",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <span className="logo" style={{ fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em", display: "flex", alignItems: "baseline", gap: 0, cursor: "default", color: text }}>
            <span className="logo-at" style={{ fontSize: 18 }}>@</span>
            <span className="logo-acc" style={{ color: textSec, transition: "color 0.2s" }}>a</span>
            <span style={{ color: textSec }}>les</span>
            <span className="logo-acc" style={{ color: textSec, transition: "color 0.2s" }}>f</span>
            <span style={{ color: textSec }}>ilipenka</span>
          </span>
          <div className="nav-desktop" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {NAV.filter(n => n !== "Contact").map(n => (
              <button key={n} className="nav-link" onClick={() => scrollTo(n)}
                style={{ background: "none", border: "none", padding: "6px 12px", fontSize: 13, color: textSec, borderRadius: 6, transition: "color 0.15s" }}>
                {n}
              </button>
            ))}
            <div style={{ width: "0.5px", height: 16, background: border, margin: "0 4px" }} />
            <a href={`mailto:${data?.hero?.email}`} className="nav-link"
              style={{ padding: "6px 10px", fontSize: 13, color: textSec, borderRadius: 6, transition: "color 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </a>
            <a href={data?.hero?.linkedin} target="_blank" rel="noreferrer" className="nav-link"
              style={{ padding: "6px 10px", fontSize: 13, color: textSec, borderRadius: 6, transition: "color 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
              </svg>
              LinkedIn
            </a>
            {/* More socials */}
            <div className="more-socials" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <button className="more-trigger nav-link" style={{ background: "none", border: "none", padding: "6px 8px", fontSize: 16, color: textSec, borderRadius: 6, letterSpacing: 2, lineHeight: 1, transition: "color 0.15s", cursor: "pointer" }}>···</button>
              <div className="more-dropdown" style={{
                display: "flex", alignItems: "center", gap: 2,
                overflow: "hidden", maxWidth: 0, opacity: 0,
                transition: "max-width 0.35s ease, opacity 0.25s ease",
                whiteSpace: "nowrap",
              }}>
                <a href={data?.hero?.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" className="nav-link"
                  style={{ padding: "6px 8px", fontSize: 13, color: textSec, borderRadius: 6, transition: "color 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                  Instagram
                </a>
                <a href={data?.hero?.telegram || "https://t.me"} target="_blank" rel="noreferrer" className="nav-link"
                  style={{ padding: "6px 8px", fontSize: 13, color: textSec, borderRadius: 6, transition: "color 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                  </svg>
                  Telegram
                </a>
              </div>
            </div>
            <button onClick={() => setDark(!d)}
              style={{ background: "none", border: `0.5px solid ${border}`, borderRadius: 8, padding: "6px 8px", color: textSec, marginLeft: 4, display: "flex", alignItems: "center", transition: "color 0.15s, border-color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = acc; e.currentTarget.style.borderColor = acc; }}
              onMouseLeave={e => { e.currentTarget.style.color = textSec; e.currentTarget.style.borderColor = border; }}>
              <Icon type={d ? "sun" : "moon"} size={15} />
            </button>
          </div>
          <div className="nav-mobile-btn" style={{ gap: 8, alignItems: "center" }}>
            <button onClick={() => setDark(!d)} style={{ background: "none", border: `0.5px solid ${border}`, borderRadius: 8, padding: "6px 8px", color: textSec, display: "flex" }}>
              <Icon type={d ? "sun" : "moon"} size={15} />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", color: text, display: "flex" }}>
              <Icon type={mobileOpen ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu" style={{ background: bg2, borderBottom: `0.5px solid ${border}`, padding: "8px 0", position: "sticky", top: 56, zIndex: 99 }}>
          {NAV.map(n => (
            <button key={n} onClick={() => scrollTo(n)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 32px", background: "none", border: "none", fontSize: 15, color: text }}>
              {n}
            </button>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>

        {/* HERO */}
        <section style={{ minHeight: "100vh", padding: "80px 0", borderBottom: `0.5px solid ${border}`, position: "relative", overflow: "visible", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden" }} viewBox="0 0 1200 700" preserveAspectRatio="xMaxYMid slice">
            <line className="node-el" x1="780" y1="80"  x2="920" y2="180" stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.25)}/>
            <line className="node-el" x1="920" y1="180" x2="1020" y2="110" stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.25)}/>
            <line className="node-el" x1="920" y1="180" x2="960"  y2="320" stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.25)}/>
            <line className="node-el" x1="960" y1="320" x2="1080" y2="280" stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.2)}/>
            <line className="node-el" x1="960" y1="320" x2="880"  y2="420" stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.2)}/>
            <line className="node-el" x1="780" y1="80"  x2="850"  y2="30"  stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.15)}/>
            <line className="node-el" x1="1020" y1="110" x2="1100" y2="50"  stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.15)}/>
            <line className="node-el" x1="1080" y1="280" x2="1150" y2="360" stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.12)}/>
            <line className="node-el" x1="880"  y1="420" x2="800"  y2="480" stroke={nodeStroke} strokeWidth="0.6" opacity={lineOp(.12)}/>
            <circle className="node-el" cx="780"  cy="80"  r="4"   fill={nodeFill} opacity={circOp(.4)}/>
            <circle className="node-el" cx="920"  cy="180" r="6"   fill={nodeFill} opacity={circOp(.5)}/>
            <circle className="node-el" cx="1020" cy="110" r="3.5" fill={nodeFill} opacity={circOp(.35)}/>
            <circle className="node-el" cx="960"  cy="320" r="5.5" fill={nodeFill} opacity={circOp(.45)}/>
            <circle className="node-el" cx="1080" cy="280" r="3"   fill={nodeFill} opacity={circOp(.28)}/>
            <circle className="node-el" cx="880"  cy="420" r="3"   fill={nodeFill} opacity={circOp(.25)}/>
            <circle className="node-el" cx="850"  cy="30"  r="2"   fill={nodeFill} opacity={circOp(.2)}/>
            <circle className="node-el" cx="1100" cy="50"  r="2"   fill={nodeFill} opacity={circOp(.2)}/>
            <circle className="node-el" cx="1150" cy="360" r="2"   fill={nodeFill} opacity={circOp(.15)}/>
            <circle className="node-el" cx="800"  cy="480" r="2"   fill={nodeFill} opacity={circOp(.12)}/>
          </svg>

          <div className="hero-grid" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 60, flexWrap: "wrap", position: "relative" }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              {data.hero.avatar && (
                <img className="hero-name" src={data.hero.avatar} alt={data.hero.name}
                  style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: `2px solid ${borderMd}`, display: "block", marginBottom: 20 }} />
              )}
              <h1 className="big hero-name" style={{ fontSize: 52, fontWeight: 500, margin: "0 0 8px", lineHeight: 1.05, color: text }}>{data.hero.name}</h1>
              <p className="hero-role" style={{ fontSize: 20, color: textSec, margin: "0 0 16px" }}>{data.hero.title}</p>
              {data.hero.available && (
                <div className="hero-tag" style={{ marginBottom: 18 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: badgeGrText, background: badgeGrBg, padding: "4px 12px", borderRadius: 20, border: `0.5px solid ${badgeGrBd}` }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, display: "inline-block", animation: "pulse 2s infinite" }} />
                    Available for projects
                  </span>
                </div>
              )}
              <p className="hero-tag" style={{ fontSize: 16, color: textSec, margin: "0 0 36px", maxWidth: 500, lineHeight: 1.75 }}>{data.hero.tagline}</p>
              <div className="hero-cta" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={`mailto:${data.hero.email}`} className="glow-btn" style={{ padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: text, color: bg }}>Get in touch</a>
                <a href={data.hero.linkedin} className="glow-btn" style={{ padding: "10px 24px", borderRadius: 8, fontSize: 13, border: `0.5px solid ${borderMd}`, color: text }}>LinkedIn</a>
              </div>
            </div>
            <div className="hero-stats" style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignSelf: "center", padding: 8, margin: -8 }}>
              {data.stats.map((s, si) => (
                <div key={s.label} className="glow-stat" style={{ background: bg2, borderRadius: 12, padding: "20px 28px", minWidth: 130, position: "relative", overflow: "hidden" }}>
                  <StatIcon index={si} acc={acc} />
                  <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1, color: text }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: textTer, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FLOW DIVIDER */}
        <FlowDivider acc={acc} border={border} text={text} textSec={textSec} bg={bg} bg2={bg2} d={d} />

        {/* ABOUT */}
        <section id="about" style={sectionStyle}>
          <Reveal>
            <p style={labelStyle}>About</p>
            <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
              <div>
                <h2 style={h2Style}>Professional story</h2>
                <p style={{ color: textSec, lineHeight: 1.75, marginBottom: 20, fontSize: 15 }}>{data.about}</p>
              </div>
              <div>
                <div style={{ marginBottom: 24 }}>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>Domains</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {data.domains.map(dm => <Tag key={dm} accent>{dm}</Tag>)}
                  </div>
                </div>
                <div>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>Regions</p>
                  <p style={{ fontSize: 14, color: textSec }}>CIS · Europe · North America</p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* EXPERTISE */}
        <section id="expertise" style={sectionStyle}>
          <Reveal>
            <p style={labelStyle}>What I do</p>
            <h2 style={h2Style}>Expertise</h2>
          </Reveal>
          <div className="exp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {data.expertise.map((e, i) => (
              <Reveal key={e.id} delay={i * 60}>
                <div className="exp-card" style={{ background: bg, border: `0.5px solid ${border}`, borderRadius: 12, padding: "22px 22px 24px", height: "100%", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 12, right: 14, fontSize: 22, fontWeight: 300, color: acc, opacity: d ? 0.3 : 0.25, fontFamily: "monospace", lineHeight: 1, letterSpacing: -2 }}>{"{ }"}</div>
                  <div style={{ color: textSec, marginBottom: 12 }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={iconPath(e.icon)} />
                    </svg>
                  </div>
                  <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 8px", color: text }}>{e.title}</p>
                  <p style={{ fontSize: 13, color: textSec, lineHeight: 1.6 }}>{e.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CASES */}
        <section id="cases" style={sectionStyle}>
          <Reveal>
            <p style={labelStyle}>Selected work</p>
            <h2 style={h2Style}>Cases</h2>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.cases.map((c, i) => (
              <Reveal key={c.id} delay={i * 60}>
                <div className="glow-case" style={{ border: `0.5px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
                  <button className="case-btn" onClick={() => setOpenCase(openCase === c.id ? null : c.id)}
                    style={{ width: "100%", background: "none", border: "none", padding: "20px 24px", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, transition: "background 0.15s" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <p style={{ fontWeight: 500, fontSize: 15, color: text }}>{c.title}</p>
                        <Tag accent>{c.domain}</Tag>
                      </div>
                      <p style={{ fontSize: 13, color: textTer }}>{c.company} · {c.period}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                        {c.tags.map(t => <Tag key={t}>{t}</Tag>)}
                      </div>
                    </div>
                    <span style={{ fontSize: 16, color: textTer, flexShrink: 0, transform: openCase === c.id ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>↓</span>
                  </button>
                  <div style={{ maxHeight: openCase === c.id ? 400 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                    <div style={{ padding: "20px 24px 24px", borderTop: `0.5px solid ${border}` }}>
                      <div className="case-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                        {[["Context", c.context], ["Task", c.task], ["Result", c.result]].map(([l, v]) => (
                          <div key={l}>
                            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: textTer, marginBottom: 8 }}>{l}</p>
                            <p style={{ fontSize: 14, color: textSec, lineHeight: 1.7 }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" style={sectionStyle}>
          <Reveal>
            <p style={labelStyle}>Career</p>
            <h2 style={h2Style}>Experience</h2>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.experience.map((e, i) => (
              <Reveal key={e.id} delay={i * 50}>
                <div className="exp-row" style={{ display: "flex", gap: 16, padding: "16px 12px", borderBottom: `0.5px solid ${border}`, alignItems: "center", borderRadius: 8, transition: "background 0.15s" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.current ? GREEN : borderMd, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: 14, color: text }}>{e.company}</p>
                    <p style={{ fontSize: 13, color: textSec, marginTop: 2 }}>{e.role}</p>
                  </div>
                  <span style={{ fontSize: 13, color: textTer, flexShrink: 0 }}>{e.period}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div style={{ marginTop: 44 }}>
              <p style={{ ...labelStyle, marginBottom: 14 }}>Stack & tools</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.stack.map(s => <Tag key={s}>{s}</Tag>)}
              </div>
            </div>
          </Reveal>
        </section>

        {/* CONTACT */}
        <section id="contact" style={{ padding: "80px 0 100px" }}>
          <Reveal>
            <p style={labelStyle}>Contact</p>
            <h2 style={h2Style}>Let's work together</h2>
            <p style={{ color: textSec, maxWidth: 480, marginBottom: 32, lineHeight: 1.75, fontSize: 15 }}>
              Open to new projects, long-term contracts, and interesting challenges. Reach out directly or connect on LinkedIn.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={`mailto:${data.hero.email}`} className="glow-btn" style={{ padding: "11px 26px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: text, color: bg }}>{data.hero.email}</a>
              <a href={data.hero.linkedin} className="glow-btn" style={{ padding: "11px 26px", borderRadius: 8, fontSize: 13, border: `0.5px solid ${borderMd}`, color: text }}>LinkedIn</a>
            </div>
            <p style={{ fontSize: 12, color: textTer, marginTop: 44 }}>{data.hero.location} — available for remote projects globally</p>
          </Reveal>
        </section>

      </div>
    </div>
  );
}