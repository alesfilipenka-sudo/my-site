import { useState, useEffect, useRef } from "react";
import SiteSkeleton from "../components/SiteSkeleton";

/* ─── Tokens ───────────────────────────────────────────────── */
const ACCENT = { hex: "#6366F1", glow: "99,102,241" }; // Electric Indigo

function tokens(dark) {
  const acc = ACCENT;
  if (dark) return {
    bg: "#0A0A0B", bg2: "#0F0F11",
    surface: "rgba(255,255,255,0.02)", surfaceHi: "rgba(255,255,255,0.04)",
    glass: "rgba(10,10,11,0.55)",
    text: "#EDEDF0", textSec: "#8B8B95", textTer: "#52525B",
    border: "rgba(255,255,255,0.06)", borderMd: "rgba(255,255,255,0.10)", borderHi: "rgba(255,255,255,0.16)",
    grid: "rgba(255,255,255,0.025)",
    acc: acc.hex, accGlow: acc.glow, ok: "#84D2A8",
  };
  return {
    bg: "#F7F7F5", bg2: "#FCFCFA",
    surface: "rgba(0,0,0,0.015)", surfaceHi: "rgba(0,0,0,0.03)",
    glass: "rgba(247,247,245,0.65)",
    text: "#0A0A0B", textSec: "#52525B", textTer: "#A1A1AA",
    border: "rgba(0,0,0,0.06)", borderMd: "rgba(0,0,0,0.10)", borderHi: "rgba(0,0,0,0.18)",
    grid: "rgba(0,0,0,0.03)",
    acc: acc.hex, accGlow: acc.glow, ok: "#1D9E75",
  };
}

const NAV_ITEMS = ["About", "Expertise", "Cases", "Experience", "Contact"];

const FLOW_STEPS = [
  { k: "01", label: "Discovery",    points: ["Stakeholder interviews", "Business context analysis", "Problem framing", "Scope definition"] },
  { k: "02", label: "Requirements", points: ["User stories & use cases", "V&S, SRS, BRD artifacts", "Prototypes in Figma", "Acceptance criteria"] },
  { k: "03", label: "Delivery",     points: ["Dev team support", "Change management", "Testing & validation", "Demo presentations"] },
  { k: "04", label: "Support",      points: ["Post-release monitoring", "Backlog refinement", "Stakeholder sync", "Knowledge base"] },
];

const EXP_ICONS = {
  doc: "M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 0v4h4M8 13h8M8 17h5",
  sys: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  fig: "M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zM12 2h3.5a3.5 3.5 0 010 7H12V2zM12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 01-7 0zM5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z",
  ai:  "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  ppl: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
};

/* ─── Hooks & primitives ──────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, y = 16 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : `translateY(${y}px)`,
      transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>{children}</div>
  );
}

function Magnetic({ children, strength = 0.25, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * strength}px, ${(e.clientY - (r.top + r.height / 2)) * strength}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <span onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: "inline-block", ...style }}>
      <span ref={ref} style={{ display: "inline-block", transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
        {children}
      </span>
    </span>
  );
}

function AnalyticalDot({ size = 8, color, pulse = false, style }) {
  return (
    <span style={{ display: "inline-block", position: "relative", width: size, height: size, ...style }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.9 }} />
      {pulse && (
        <span style={{
          position: "absolute", inset: -3, borderRadius: "50%",
          border: `1px solid ${color}`, opacity: 0.4,
          animation: "ap-pulseRing 2.4s ease-out infinite",
        }} />
      )}
    </span>
  );
}

function Crosshair({ size = 6, color, style }) {
  return (
    <svg width={size * 2} height={size * 2} viewBox={`0 0 ${size * 2} ${size * 2}`} style={style}>
      <line x1={size} y1="0" x2={size} y2={size * 2} stroke={color} strokeWidth="0.5" />
      <line x1="0" y1={size} x2={size * 2} y2={size} stroke={color} strokeWidth="0.5" />
    </svg>
  );
}

function Kicker({ children, T, num }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      {num !== undefined && (
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.acc, letterSpacing: "0.08em" }}>
          {String(num).padStart(2, "0")}
        </span>
      )}
      <span style={{ height: 1, flex: "0 0 32px", background: T.borderHi }} />
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.textSec, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500 }}>{children}</span>
    </div>
  );
}

function Tag({ children, T, accent }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 4,
      fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.04em",
      textTransform: "uppercase", fontWeight: 500,
      background: accent ? `rgba(${T.accGlow},0.08)` : T.surface,
      color: accent ? T.acc : T.textSec,
      border: `0.5px solid ${accent ? `rgba(${T.accGlow},0.35)` : T.border}`,
    }}>{children}</span>
  );
}

function SocialIcon({ kind, size = 14 }) {
  const p = {
    email: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    linkedin: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></>,
    telegram: <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
  }[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
  );
}

/* ─── Hero backdrop (data-flow schematic) ─────────────────── */
function HeroBackdrop({ T }) {
  const nodes = [
    [80,100,3,.4],[200,80,4,.55],[340,140,3,.4],[460,90,5,.7],
    [120,240,2.5,.3],[260,280,4,.55],[380,240,3,.4],
    [80,380,3,.4],[220,420,4,.55],[360,380,2.5,.3],[480,440,3,.4],
    [560,200,3,.4],[620,320,2.5,.3],
    [780,80,3,.4],[880,160,5,.65],[1000,100,3,.4],[1120,200,4,.5],
    [780,280,4,.55],[920,320,6,.85],[1040,280,3,.4],[1140,380,3,.4],
    [820,460,3,.4],[960,480,4,.5],[1080,440,3,.4],
  ];
  const edges = [[0,1],[1,2],[2,3],[1,4],[4,5],[5,6],[2,6],[5,8],[7,8],[8,9],[9,10],[6,10],[3,11],[11,12],
    [13,14],[14,15],[15,16],[14,17],[17,18],[18,19],[19,20],[18,22],[21,22],[22,23],[19,23],
    [12,17],[11,17],[6,17],[10,21]];
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
      viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ap-heroGlow" cx="80%" cy="60%" r="55%">
          <stop offset="0%" stopColor={T.acc} stopOpacity="0.18" />
          <stop offset="100%" stopColor={T.acc} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ap-fadeMaskL" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="50%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.3" />
        </linearGradient>
        <mask id="ap-hbMask"><rect x="0" y="0" width="1200" height="600" fill="url(#ap-fadeMaskL)" /></mask>
      </defs>
      <ellipse cx="940" cy="330" rx="380" ry="280" fill="url(#ap-heroGlow)" />
      <g mask="url(#ap-hbMask)">
        {edges.map(([a, b], i) => {
          const [x1, y1] = nodes[a]; const [x2, y2] = nodes[b];
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.acc} strokeWidth="0.5" opacity="0.18" />;
        })}
        {nodes.map(([x, y, r, o], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r + 3} fill={T.acc} opacity={o * 0.12} />
            <circle cx={x} cy={y} r={r} fill={T.acc} opacity={o} />
          </g>
        ))}
        <circle cx="920" cy="320" r="44" fill="none" stroke={T.acc} strokeWidth="0.5" opacity="0.35" strokeDasharray="2 4" />
        <circle cx="920" cy="320" r="68" fill="none" stroke={T.acc} strokeWidth="0.5" opacity="0.18" />
      </g>
    </svg>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function Site() {
  const [data, setData] = useState(null);
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCase, setOpenCase] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetch(`/content.json?v=${Date.now()}`).then(r => r.json()).then(setData);
  }, []);

  useEffect(() => {
    const sys = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(sys.matches);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!data) return <SiteSkeleton />;

  const T = tokens(dark);
  const tStr = time.toLocaleTimeString("en-US", { hour12: false, timeZone: "Europe/Minsk" });
  const visibleStats = (data.stats || []).filter(s => !s.hidden);
  const cases = (data.cases || []).filter(c => !c.hidden);
  const expertise = (data.expertise || []).filter(e => !e.hidden);
  const experience = (data.experience || []).filter(e => !e.hidden);

  if (openCase === null && cases[0]) openCase; // no-op, just to mention

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const css = `
    :root {
      --sans: 'Inter', system-ui, -apple-system, sans-serif;
      --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: var(--sans); background: ${T.bg}; color: ${T.text}; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; }
    ::selection { background: rgba(${T.accGlow},0.3); color: inherit; }
    @keyframes ap-pulseRing {
      0% { transform: scale(0.9); opacity: 0.6; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    .ap-nav-link:hover, .ap-nav-icon:hover { color: ${T.text} !important; border-color: ${T.borderMd} !important; }
    .ap-case-row:hover { background: ${T.surfaceHi} !important; }
    .ap-exp-row:hover  { background: ${T.surfaceHi} !important; }
    .ap-exp-card { transition: background 0.25s; }
    .ap-exp-card:hover { background: ${T.surfaceHi} !important; }
    @media (max-width: 900px) {
      .ap-hero-grid, .ap-about-grid, .ap-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
      .ap-process-grid, .ap-expertise-grid { grid-template-columns: 1fr 1fr !important; }
      .ap-case-row { grid-template-columns: 36px 1fr 32px !important; gap: 14px !important; padding: 18px !important; }
      .ap-case-tags { display: none !important; }
      .ap-case-cols { grid-template-columns: 1fr !important; gap: 18px !important; padding: 0 18px 22px 60px !important; }
      .ap-nav-desktop { display: none !important; }
      .ap-nav-mobile-btn { display: inline-flex !important; }
      .ap-main { padding: 0 18px !important; }
      .ap-exp-row { grid-template-columns: 110px 1fr !important; gap: 14px !important; padding-left: 22px !important; }
    }
    @media (max-width: 600px) {
      .ap-process-grid, .ap-expertise-grid { grid-template-columns: 1fr !important; }
    }
  `;

  const socialBtn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, borderRadius: 6,
    color: T.textSec, border: `0.5px solid ${T.border}`,
    background: T.surface, transition: "color 0.2s, border-color 0.2s",
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: T.bg, color: T.text }}>
      <style>{css}</style>

      {/* Grid overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `linear-gradient(to right, ${T.grid} 0.5px, transparent 0.5px), linear-gradient(to bottom, ${T.grid} 0.5px, transparent 0.5px)`,
        backgroundSize: `120px 120px`,
        maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)",
      }} />

      {/* Frame markers */}
      <Crosshair color={T.borderHi} style={{ position: "fixed", top: 16, left: 16, zIndex: 1 }} />
      <Crosshair color={T.borderHi} style={{ position: "fixed", top: 16, right: 16, zIndex: 1 }} />
      <Crosshair color={T.borderHi} style={{ position: "fixed", bottom: 16, left: 16, zIndex: 1 }} />
      <Crosshair color={T.borderHi} style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* NAV */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: scrolled ? T.glass : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
          borderBottom: `0.5px solid ${scrolled ? T.border : "transparent"}`,
          transition: "background 0.3s, border-color 0.3s",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "baseline",
              fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: T.text }}>
              <span style={{ color: T.textTer, fontSize: 14, marginRight: 1 }}>@</span>
              <span>ales</span>
              <span style={{ color: T.acc }}>f</span>
              <span>ilipenka</span>
            </span>

            <div className="ap-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {NAV_ITEMS.filter(n => n !== "Contact").map((n, i) => (
                <button key={n} onClick={() => scrollTo(n)} className="ap-nav-link"
                  style={{ background: "none", border: "none", padding: "8px 12px",
                    fontSize: 12.5, color: T.textSec, fontWeight: 500, borderRadius: 6, transition: "color 0.2s" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer, marginRight: 6 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {n}
                </button>
              ))}
              <div style={{ width: 1, height: 16, background: T.border, margin: "0 8px" }} />

              <a href={`mailto:${data.hero.email}`} className="ap-nav-icon" style={socialBtn} title="Email"><SocialIcon kind="email" /></a>
              {data.hero.linkedin && <a href={data.hero.linkedin} target="_blank" rel="noreferrer" className="ap-nav-icon" style={socialBtn} title="LinkedIn"><SocialIcon kind="linkedin" /></a>}
              {data.hero.instagram && <a href={data.hero.instagram} target="_blank" rel="noreferrer" className="ap-nav-icon" style={socialBtn} title="Instagram"><SocialIcon kind="instagram" /></a>}
              {data.hero.telegram && <a href={data.hero.telegram} target="_blank" rel="noreferrer" className="ap-nav-icon" style={socialBtn} title="Telegram"><SocialIcon kind="telegram" /></a>}

              <button onClick={() => setDark(!dark)} className="ap-nav-icon" style={{ ...socialBtn, marginLeft: 4 }} title="Toggle theme">
                <SocialIcon kind={dark ? "sun" : "moon"} />
              </button>

              <Magnetic strength={0.2} style={{ marginLeft: 4 }}>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo("Contact"); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "8px 14px", borderRadius: 6,
                    background: T.acc, color: T.bg,
                    fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em",
                    boxShadow: `0 0 0 0.5px ${T.acc}, 0 4px 24px -8px rgba(${T.accGlow},0.6)`,
                  }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.bg, opacity: 0.6 }} />
                  Get in touch
                </a>
              </Magnetic>
            </div>

            <button className="ap-nav-mobile-btn" onClick={() => setMobileOpen(o => !o)}
              style={{ display: "none", background: T.surface, border: `0.5px solid ${T.border}`,
                color: T.text, borderRadius: 6, padding: 8, alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div style={{ background: T.bg2, borderTop: `0.5px solid ${T.border}`, padding: "12px 24px 18px" }}>
              {NAV_ITEMS.map(n => (
                <button key={n} onClick={() => scrollTo(n)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 8px", background: "none", border: "none",
                  borderBottom: `0.5px solid ${T.border}`, fontSize: 14, color: T.text, fontWeight: 500,
                }}>{n}</button>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <a href={`mailto:${data.hero.email}`} style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="email" /> Email</a>
                {data.hero.linkedin && <a href={data.hero.linkedin} target="_blank" rel="noreferrer" style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="linkedin" /> LinkedIn</a>}
                {data.hero.instagram && <a href={data.hero.instagram} target="_blank" rel="noreferrer" style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="instagram" /> Instagram</a>}
                {data.hero.telegram && <a href={data.hero.telegram} target="_blank" rel="noreferrer" style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="telegram" /> Telegram</a>}
              </div>
            </div>
          )}
        </nav>

        <main className="ap-main" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

          {/* HERO */}
          <section style={{ position: "relative", padding: "60px 0 80px", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <HeroBackdrop T={T} />

            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40, flexWrap: "wrap",
                fontFamily: "var(--mono)", fontSize: 10.5, color: T.textTer, letterSpacing: "0.08em", textTransform: "uppercase", position: "relative" }}>
                {data.hero.available && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AnalyticalDot size={6} color={T.ok} pulse />
                    <span style={{ color: T.ok }}>Available for projects</span>
                  </div>
                )}
                <span style={{ height: 1, width: 20, background: T.borderMd }} />
                <span>{data.hero.location}</span>
                <span style={{ color: T.text, fontVariantNumeric: "tabular-nums" }}>{tStr}</span>
              </div>
            </Reveal>

            <div className="ap-hero-grid" style={{ position: "relative", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center" }}>
              <div>
                <Reveal delay={80}>
                  {data.hero.avatar && (
                    <img src={data.hero.avatar} alt={data.hero.name}
                      style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover",
                        border: `0.5px solid ${T.borderHi}`, marginBottom: 22, display: "block",
                        boxShadow: `0 0 0 4px ${T.surface}` }} />
                  )}
                  <h1 style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 500, lineHeight: 0.98,
                    letterSpacing: "-0.035em", color: T.text, margin: 0 }}>
                    {data.hero.name.split(" ")[0]}<br />
                    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 16 }}>
                      {data.hero.name.split(" ").slice(1).join(" ")}
                      <span style={{ width: 12, height: 12, background: T.acc, borderRadius: 2,
                        boxShadow: `0 0 24px rgba(${T.accGlow},0.7)`, display: "inline-block" }} />
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={180}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 24px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: T.acc,
                      padding: "4px 10px", background: `rgba(${T.accGlow},0.08)`,
                      border: `0.5px solid rgba(${T.accGlow},0.35)`, borderRadius: 4, letterSpacing: "0.04em" }}>
                      {data.hero.title}
                    </span>
                    <span style={{ height: 1, flex: 1, maxWidth: 80, background: T.borderMd }} />
                  </div>
                </Reveal>

                <Reveal delay={260}>
                  <p style={{ fontSize: 17, lineHeight: 1.55, color: T.textSec, maxWidth: 540,
                    margin: "0 0 36px", letterSpacing: "-0.005em" }}>{data.hero.tagline}</p>
                </Reveal>

                <Reveal delay={340}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <Magnetic strength={0.3}>
                      <a href={`mailto:${data.hero.email}`} style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        padding: "13px 24px", background: T.acc, color: T.bg,
                        fontSize: 13, fontWeight: 600, borderRadius: 8, position: "relative",
                        boxShadow: `0 0 0 0.5px ${T.acc}, 0 0 0 4px rgba(${T.accGlow},0.12), 0 0 24px rgba(${T.accGlow},0.55), 0 0 60px rgba(${T.accGlow},0.35), 0 12px 40px -8px rgba(${T.accGlow},0.6)`,
                      }}>
                        Start a project
                        <span style={{ fontFamily: "var(--mono)", opacity: 0.7 }}>→</span>
                      </a>
                    </Magnetic>
                    <Magnetic strength={0.2}>
                      <a href={data.hero.linkedin} target="_blank" rel="noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "13px 22px", color: T.text, fontSize: 13, fontWeight: 500,
                        border: `0.5px solid ${T.borderHi}`, borderRadius: 8, background: T.surface,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.textSec }} />
                        LinkedIn
                      </a>
                    </Magnetic>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={400}>
                <div style={{ background: T.bg2, border: `0.5px solid ${T.border}`,
                  borderRadius: 12, position: "relative",
                  boxShadow: `0 1px 0 ${T.border}, 0 30px 80px -40px rgba(0,0,0,0.5)` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 18px", borderBottom: `0.5px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <AnalyticalDot size={6} color={T.acc} />
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: T.textSec, letterSpacing: "0.1em", textTransform: "uppercase" }}>/metrics</span>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer, letterSpacing: "0.06em" }}>
                      {String(visibleStats.length).padStart(2, "0")} INDICATORS
                    </span>
                  </div>
                  <div style={{ display: "grid",
                    gridTemplateColumns: visibleStats.length >= 4 ? "1fr 1fr" : `repeat(${Math.min(visibleStats.length, 2)}, 1fr)` }}>
                    {visibleStats.map((s, i) => {
                      const cols = visibleStats.length >= 4 ? 2 : Math.min(visibleStats.length, 2);
                      const isLastRow = i >= visibleStats.length - cols;
                      const isLastCol = (i + 1) % cols === 0;
                      return (
                        <div key={s.label + i} style={{ padding: "22px 20px",
                          borderRight: !isLastCol ? `0.5px solid ${T.border}` : "none",
                          borderBottom: !isLastRow ? `0.5px solid ${T.border}` : "none" }}>
                          <div style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, color: T.text,
                            letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer,
                            letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* PROCESS */}
          <section style={{ padding: "80px 0", borderTop: `0.5px solid ${T.border}` }}>
            <Reveal><Kicker T={T} num="00">Process — how engagements run</Kicker></Reveal>
            <Reveal delay={100}>
              <div className="ap-process-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                border: `0.5px solid ${T.border}`, borderRadius: 12, background: T.bg2, overflow: "hidden" }}>
                {FLOW_STEPS.map((s, i) => (
                  <div key={s.k} style={{ padding: "28px 24px",
                    borderRight: i < 3 ? `0.5px solid ${T.border}` : "none" }}>
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.acc,
                        padding: "2px 6px", border: `0.5px solid rgba(${T.accGlow},0.35)`,
                        background: `rgba(${T.accGlow},0.06)`, borderRadius: 3 }}>{s.k}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: T.text, marginBottom: 14, letterSpacing: "-0.01em" }}>
                      {s.label}
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {s.points.map(p => (
                        <li key={p} style={{ fontSize: 12.5, color: T.textSec, lineHeight: 1.65,
                          paddingLeft: 14, position: "relative", marginBottom: 4 }}>
                          <span style={{ position: "absolute", left: 0, top: 9, width: 6, height: 1, background: T.borderHi }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ABOUT */}
          <section id="about" style={{ padding: "100px 0", borderTop: `0.5px solid ${T.border}` }}>
            <Reveal><Kicker T={T} num="01">About</Kicker></Reveal>
            <div className="ap-about-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "start" }}>
              <div>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500, lineHeight: 1.1,
                    letterSpacing: "-0.025em", color: T.text, margin: "0 0 28px" }}>
                    Professional<br /><span style={{ color: T.acc }}>story.</span>
                  </h2>
                </Reveal>
                <Reveal delay={160}>
                  <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.7, marginBottom: 28,
                    letterSpacing: "-0.005em", maxWidth: 560 }}>{data.about}</p>
                </Reveal>
              </div>
              <Reveal delay={200}>
                <div style={{ background: T.bg2, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer,
                      letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>── Domains</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(data.domains || []).map(d => <Tag key={d} T={T} accent>{d}</Tag>)}
                    </div>
                  </div>
                  <div style={{ paddingTop: 20, borderTop: `0.5px dashed ${T.border}` }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer,
                      letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>── Regions</div>
                    <p style={{ fontSize: 14, color: T.text, margin: 0, lineHeight: 1.6 }}>CIS · Europe · North America</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* EXPERTISE */}
          <section id="expertise" style={{ padding: "100px 0", borderTop: `0.5px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 24, flexWrap: "wrap" }}>
              <div>
                <Reveal><Kicker T={T} num="02">Expertise</Kicker></Reveal>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500, lineHeight: 1.1,
                    letterSpacing: "-0.025em", color: T.text, margin: 0 }}>What I do.</h2>
                </Reveal>
              </div>
              <Reveal delay={160}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.textTer, letterSpacing: "0.06em" }}>
                  {String(expertise.length).padStart(2, "0")} / disciplines
                </span>
              </Reveal>
            </div>

            <div className="ap-expertise-grid" style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              border: `0.5px solid ${T.border}`, borderRadius: 12, overflow: "hidden", background: T.bg2 }}>
              {expertise.map((e, i) => (
                <Reveal key={e.id} delay={i * 60}>
                  <div className="ap-exp-card" style={{ padding: "28px 24px",
                    borderRight: `0.5px solid ${T.border}`, borderBottom: `0.5px solid ${T.border}`,
                    minHeight: 200, position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <span style={{ width: 36, height: 36, borderRadius: 8,
                        background: T.surface, border: `0.5px solid ${T.border}`,
                        display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.acc }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d={EXP_ICONS[e.icon] || EXP_ICONS.doc} />
                        </svg>
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer, letterSpacing: "0.06em" }}>
                        /{String(e.id).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 500, color: T.text, margin: "0 0 6px", letterSpacing: "-0.01em" }}>{e.title}</h3>
                    <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.65, margin: 0 }}>{e.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* CASES */}
          <section id="cases" style={{ padding: "100px 0", borderTop: `0.5px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 24, flexWrap: "wrap" }}>
              <div>
                <Reveal><Kicker T={T} num="03">Selected work</Kicker></Reveal>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500, lineHeight: 1.1,
                    letterSpacing: "-0.025em", color: T.text, margin: 0 }}>Cases.</h2>
                </Reveal>
              </div>
              <Reveal delay={160}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.textTer, letterSpacing: "0.06em" }}>
                  {String(cases.length).padStart(2, "0")} featured
                </span>
              </Reveal>
            </div>

            <div style={{ border: `0.5px solid ${T.border}`, borderRadius: 12, overflow: "hidden", background: T.bg2 }}>
              {cases.map((c, idx) => {
                const isOpen = openCase === c.id;
                return (
                  <div key={c.id} style={{ borderBottom: idx < cases.length - 1 ? `0.5px solid ${T.border}` : "none" }}>
                    <button onClick={() => setOpenCase(isOpen ? null : c.id)} className="ap-case-row"
                      style={{ width: "100%", background: "none", border: "none", padding: "24px 28px",
                        textAlign: "left", display: "grid",
                        gridTemplateColumns: "44px 1fr 180px 36px", gap: 20, alignItems: "center",
                        fontFamily: "inherit", color: "inherit", transition: "background 0.2s" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.acc, letterSpacing: "0.04em" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 17, fontWeight: 500, color: T.text, letterSpacing: "-0.01em" }}>{c.title}</span>
                          <Tag T={T} accent>{c.domain}</Tag>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8,
                          fontFamily: "var(--mono)", fontSize: 11, color: T.textTer, letterSpacing: "0.04em" }}>
                          <span>{c.company}</span>
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: T.borderHi }} />
                          <span>{c.period}</span>
                        </div>
                      </div>
                      <div className="ap-case-tags" style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
                        {(c.tags || []).slice(0, 2).map(t => (
                          <span key={t} style={{ fontFamily: "var(--mono)", fontSize: 9.5, padding: "2px 6px",
                            color: T.textSec, border: `0.5px solid ${T.border}`,
                            borderRadius: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t}</span>
                        ))}
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: "50%",
                        border: `0.5px solid ${isOpen ? T.acc : T.borderHi}`,
                        background: isOpen ? T.acc : "transparent", color: isOpen ? T.bg : T.textSec,
                        fontFamily: "var(--mono)", fontSize: 14, transition: "all 0.25s", marginLeft: "auto" }}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    <div style={{ maxHeight: isOpen ? 600 : 0, overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
                      <div className="ap-case-cols" style={{ padding: "0 28px 28px 92px",
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24,
                        borderTop: `0.5px dashed ${T.border}`, paddingTop: 20 }}>
                        {[["Context", c.context], ["Task", c.task], ["Result", c.result]].map(([label, val], i) => (
                          <div key={label}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: T.acc, letterSpacing: "0.1em" }}>
                                {String(i + 1).padStart(2, "0")} ·
                              </span>
                              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textSec,
                                letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
                            </div>
                            <p style={{ fontSize: 13.5, color: T.text, lineHeight: 1.65, margin: 0 }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* EXPERIENCE */}
          <section id="experience" style={{ padding: "100px 0", borderTop: `0.5px solid ${T.border}` }}>
            <Reveal><Kicker T={T} num="04">Experience</Kicker></Reveal>
            <Reveal delay={80}>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500, lineHeight: 1.1,
                letterSpacing: "-0.025em", color: T.text, margin: "0 0 44px" }}>Career timeline.</h2>
            </Reveal>

            <div style={{ position: "relative", borderLeft: `0.5px solid ${T.border}`, marginLeft: 12 }}>
              {experience.map((e, i) => (
                <Reveal key={e.id} delay={i * 50}>
                  <div className="ap-exp-row" style={{ display: "grid", gridTemplateColumns: "180px 1fr",
                    gap: 28, padding: "22px 24px 22px 32px", position: "relative",
                    borderBottom: i < experience.length - 1 ? `0.5px solid ${T.border}` : "none",
                    alignItems: "center", transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", left: -5, top: 26,
                      width: 9, height: 9, borderRadius: "50%",
                      background: e.current ? T.acc : T.bg,
                      border: `1px solid ${e.current ? T.acc : T.borderHi}`,
                      boxShadow: e.current ? `0 0 12px rgba(${T.accGlow},0.6)` : "none" }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: T.textTer,
                      letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }}>{e.period}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: T.text, letterSpacing: "-0.01em", marginBottom: 4 }}>
                        {e.company}
                        {e.current && (
                          <span style={{ marginLeft: 10, fontFamily: "var(--mono)", fontSize: 9.5,
                            color: T.acc, padding: "2px 6px",
                            background: `rgba(${T.accGlow},0.08)`,
                            border: `0.5px solid rgba(${T.accGlow},0.35)`,
                            borderRadius: 3, letterSpacing: "0.06em", textTransform: "uppercase",
                            verticalAlign: "middle" }}>Now</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: T.textSec, letterSpacing: "-0.005em" }}>{e.role}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <div style={{ marginTop: 44 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer,
                  letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>── Stack & tools</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(data.stack || []).map(s => <Tag key={s} T={T}>{s}</Tag>)}
                </div>
              </div>
            </Reveal>
          </section>

          {/* CONTACT */}
          <section id="contact" style={{ padding: "100px 0 64px", borderTop: `0.5px solid ${T.border}`, position: "relative" }}>
            <div className="ap-contact-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "start" }}>
              <div>
                <Reveal><Kicker T={T} num="05">Contact</Kicker></Reveal>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 500, lineHeight: 1.0,
                    letterSpacing: "-0.03em", color: T.text, margin: "0 0 28px" }}>
                    Let's work<br /><span style={{ color: T.acc }}>together.</span>
                  </h2>
                </Reveal>
                <Reveal delay={160}>
                  <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.6, maxWidth: 480,
                    marginBottom: 36, letterSpacing: "-0.005em" }}>
                    Open to new projects, long-term contracts, and interesting challenges. Reach out directly or connect on LinkedIn.
                  </p>
                </Reveal>
                <Reveal delay={240}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <Magnetic strength={0.3}>
                      <a href={`mailto:${data.hero.email}`} style={{
                        display: "inline-flex", alignItems: "center", gap: 12,
                        padding: "14px 24px", background: T.acc, color: T.bg,
                        fontSize: 13.5, fontWeight: 600, borderRadius: 8,
                        boxShadow: `0 0 0 0.5px ${T.acc}, 0 0 0 4px rgba(${T.accGlow},0.12), 0 0 24px rgba(${T.accGlow},0.55), 0 0 60px rgba(${T.accGlow},0.35), 0 12px 40px -8px rgba(${T.accGlow},0.7)`,
                      }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{data.hero.email}</span>
                        <span style={{ fontFamily: "var(--mono)" }}>→</span>
                      </a>
                    </Magnetic>
                    <Magnetic strength={0.2}>
                      <a href={data.hero.linkedin} target="_blank" rel="noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "14px 22px", color: T.text, fontSize: 13.5, fontWeight: 500,
                        border: `0.5px solid ${T.borderHi}`, borderRadius: 8,
                      }}>LinkedIn</a>
                    </Magnetic>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                    {data.hero.instagram && (
                      <a href={data.hero.instagram} target="_blank" rel="noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "8px 14px", color: T.textSec, fontSize: 12, fontWeight: 500,
                        border: `0.5px solid ${T.border}`, borderRadius: 6, background: T.surface,
                      }}><SocialIcon kind="instagram" size={13} /> Instagram</a>
                    )}
                    {data.hero.telegram && (
                      <a href={data.hero.telegram} target="_blank" rel="noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "8px 14px", color: T.textSec, fontSize: 12, fontWeight: 500,
                        border: `0.5px solid ${T.border}`, borderRadius: 6, background: T.surface,
                      }}><SocialIcon kind="telegram" size={13} /> Telegram</a>
                    )}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={300}>
                <div style={{ background: T.bg2, border: `0.5px solid ${T.border}`, borderRadius: 12,
                  padding: 22, fontFamily: "var(--mono)", fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ color: T.textSec, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 10 }}>/availability</span>
                    {data.hero.available && <AnalyticalDot size={6} color={T.ok} pulse />}
                  </div>
                  {[
                    ["Status",    data.hero.available ? "Available" : "Booked", data.hero.available ? T.ok : T.textSec],
                    ["Location",  data.hero.location, T.text],
                    ["Remote",    "Global", T.text],
                    ["Languages", "RU · EN (C1)", T.text],
                  ].map(([k, v, c], i, a) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < a.length - 1 ? `0.5px dashed ${T.border}` : "none" }}>
                      <span style={{ color: T.textTer, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 10 }}>{k}</span>
                      <span style={{ color: c, letterSpacing: "0.02em" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div style={{ marginTop: 80, paddingTop: 24, borderTop: `0.5px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
              fontFamily: "var(--mono)", fontSize: 10.5, color: T.textTer, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>© {new Date().getFullYear()} · {data.hero.name}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span>Built with precision</span>
                <AnalyticalDot size={5} color={T.acc} />
              </span>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
