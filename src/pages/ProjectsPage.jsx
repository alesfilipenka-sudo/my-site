import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { tokens } from "../lib/tokens.js";
import ProjectCard from "../components/ProjectCard.jsx";
import { AnalyticalDot, Tag } from "../lib/projectAssets.jsx";

/* ── List-row (компактная табличная раскладка) ──────────────────── */
function ProjectRow({ T, p, i, isLast }) {
  const sm = p.status === "ready"
    ? { label: "Ready",  dot: T.ok }
    : { label: "In dev", dot: T.acc };
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "40px 1fr 130px 100px 110px 28px",
      gap: 16, padding: "16px 22px", alignItems: "center",
      borderBottom: isLast ? "none" : `0.5px solid ${T.border}`,
      transition: "background 0.2s, color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = T.surface}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.acc, letterSpacing: "0.04em" }}>
        {String(i + 1).padStart(2, "0")}
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 3 }}>{p.title}</div>
        <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5 }}>{p.desc}</div>
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: T.textTer, letterSpacing: "0.04em" }}>{p.company}</span>
      {p.domain ? <Tag T={T} accent>{p.domain}</Tag> : <span />}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--mono)", fontSize: 10, color: sm.dot, letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        <AnalyticalDot size={5} color={sm.dot} pulse={p.status !== "ready"} />
        {sm.label}
      </span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: T.textTer, textAlign: "right" }}>→</span>
    </div>
  );
}

/* ── Facet-group (фасет с чекбоксами и счётчиками) ───────────────── */
function FacetGroup({ T, title, items, selected, onToggle, countFn }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontFamily: "var(--mono)", fontSize: 10, color: T.textTer,
        letterSpacing: "0.12em", textTransform: "uppercase",
        marginBottom: 12, paddingBottom: 8, borderBottom: `0.5px solid ${T.border}`,
      }}>{title}</div>
      {items.map(it => {
        const checked = selected.has(it);
        return (
          <label key={it} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 0", cursor: "pointer", fontSize: 13,
            color: checked ? T.text : T.textSec,
          }} onClick={() => onToggle(it)}>
            <span style={{
              width: 14, height: 14, borderRadius: 3,
              border: `0.5px solid ${checked ? T.acc : T.borderHi}`,
              background: checked ? T.acc : "transparent",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
            }}>
              {checked && (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke={T.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span style={{ flex: 1 }}>{it}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer }}>
              {countFn(it)}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function ProjectsPage() {
  // theme
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sys = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(sys.matches);
  }, []);
  const T = tokens(dark);

  // data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        const list = (data || [])
          .filter(p => !p.hidden)
          .sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100));
        if (!cancelled) { setProjects(list); setLoading(false); }
      } catch {
        if (!cancelled) { setProjects([]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // filters
  const [domains, setDomains]     = useState(new Set());
  const [companies, setCompanies] = useState(new Set());
  const [statuses, setStatuses]   = useState(new Set());
  const [q, setQ]                 = useState("");
  const [view, setView]           = useState("grid"); // grid | list

  const toggle = (set, setter, v) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setter(next);
  };
  const countBy = (key, val) => projects.filter(p => p[key] === val).length;

  const filtered = useMemo(() => projects.filter(p =>
    (!domains.size   || domains.has(p.domain)) &&
    (!companies.size || companies.has(p.company)) &&
    (!statuses.size  || statuses.has(p.status)) &&
    (!q || (`${p.title} ${p.desc} ${p.company} ${p.domain}`).toLowerCase().includes(q.toLowerCase()))
  ), [projects, domains, companies, statuses, q]);

  const allDomains   = useMemo(() => [...new Set(projects.map(p => p.domain).filter(Boolean))], [projects]);
  const allCompanies = useMemo(() => [...new Set(projects.map(p => p.company).filter(Boolean))], [projects]);

  const activeCount = domains.size + companies.size + statuses.size + (q ? 1 : 0);
  const clearAll    = () => { setDomains(new Set()); setCompanies(new Set()); setStatuses(new Set()); setQ(""); };

  const now = new Date();

  const chipStyle = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 10px", borderRadius: 999,
    fontFamily: "var(--mono)", fontSize: 10,
    color: T.acc, background: `rgba(${T.accGlow},0.08)`,
    border: `0.5px solid rgba(${T.accGlow},0.35)`,
    letterSpacing: "0.04em", cursor: "pointer",
  };

  return (
    <div style={{
      background: T.bg, color: T.text, minHeight: "100vh",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 64px 80px" }} className="projects-archive-shell">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "var(--mono)", fontSize: 11, color: T.textTer,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 28,
            textDecoration: "none",
          }}>
            <span>←</span> Back to home
          </Link>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 11, color: T.acc,
                letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10,
              }}>
                <span style={{ opacity: 0.5 }}>/</span> Projects archive
              </div>
              <h1 style={{
                fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 500, lineHeight: 1.0,
                letterSpacing: "-0.03em", color: T.text, margin: 0,
              }}>All projects.</h1>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              fontFamily: "var(--mono)", fontSize: 11, color: T.textTer, letterSpacing: "0.06em",
              fontVariantNumeric: "tabular-nums",
            }}>
              <span>{String(filtered.length).padStart(2, "0")} of {String(projects.length).padStart(2, "0")}</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.borderHi }} />
              <span>Updated {now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="projects-archive-layout" style={{
          display: "grid", gridTemplateColumns: "240px 1fr", gap: 40, alignItems: "start",
        }}>
          {/* Sidebar */}
          <aside className="projects-archive-sidebar" style={{
            position: "sticky", top: 24,
            background: T.bg2, border: `0.5px solid ${T.border}`, borderRadius: 12,
            padding: "24px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 11, color: T.text,
                letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
              }}>Filters</span>
              {activeCount > 0 && (
                <button onClick={clearAll} style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: 10, color: T.acc,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>Clear ({activeCount})</button>
              )}
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", marginBottom: 24,
              background: T.bg, border: `0.5px solid ${q ? `rgba(${T.accGlow},0.45)` : T.borderHi}`,
              borderRadius: 8, transition: "border-color 0.2s",
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={q ? T.acc : T.textTer} strokeWidth="1.4">
                <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" />
              </svg>
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: T.text, fontFamily: "var(--mono)", fontSize: 11.5,
                  width: "100%", padding: 0, letterSpacing: "0.01em",
                }}
              />
              {q && (
                <button onClick={() => setQ("")} style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: T.textTer, fontFamily: "var(--mono)", fontSize: 12, padding: 0, lineHeight: 1,
                }}>×</button>
              )}
            </div>

            <FacetGroup T={T} title="Status"  items={["ready", "in-dev"]}
              selected={statuses}  onToggle={(v) => toggle(statuses,  setStatuses,  v)} countFn={(v) => countBy("status",  v)} />
            <FacetGroup T={T} title="Domain"  items={allDomains}
              selected={domains}   onToggle={(v) => toggle(domains,   setDomains,   v)} countFn={(v) => countBy("domain",  v)} />
            <FacetGroup T={T} title="Company" items={allCompanies}
              selected={companies} onToggle={(v) => toggle(companies, setCompanies, v)} countFn={(v) => countBy("company", v)} />
          </aside>

          {/* Main column */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 16, marginBottom: 18, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", flex: 1, minHeight: 26 }}>
                {activeCount > 0 && (
                  <>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10, color: T.textTer,
                      letterSpacing: "0.1em", textTransform: "uppercase", marginRight: 4,
                    }}>Active:</span>
                    {q && (
                      <span style={chipStyle}>
                        <span style={{ opacity: 0.7 }}>q:</span>"{q}"
                        <span onClick={() => setQ("")} style={{ opacity: 0.6, cursor: "pointer" }}>×</span>
                      </span>
                    )}
                    {[...statuses].map(v => (
                      <span key={"s-" + v} style={chipStyle} onClick={() => toggle(statuses, setStatuses, v)}>
                        {v} <span style={{ opacity: 0.5 }}>×</span>
                      </span>
                    ))}
                    {[...domains].map(v => (
                      <span key={"d-" + v} style={chipStyle} onClick={() => toggle(domains, setDomains, v)}>
                        {v} <span style={{ opacity: 0.5 }}>×</span>
                      </span>
                    ))}
                    {[...companies].map(v => (
                      <span key={"c-" + v} style={chipStyle} onClick={() => toggle(companies, setCompanies, v)}>
                        {v} <span style={{ opacity: 0.5 }}>×</span>
                      </span>
                    ))}
                  </>
                )}
              </div>

              <div style={{
                display: "flex", border: `0.5px solid ${T.border}`,
                borderRadius: 6, overflow: "hidden", background: T.bg2,
              }}>
                {[
                  { id: "grid", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
                  { id: "list", icon: "M4 6h16M4 12h16M4 18h16" },
                ].map(v => {
                  const active = view === v.id;
                  return (
                    <button key={v.id} onClick={() => setView(v.id)} style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "7px 12px", border: "none", cursor: "pointer",
                      fontFamily: "var(--mono)", fontSize: 10.5,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      color: active ? T.bg : T.textSec,
                      background: active ? T.acc : "transparent",
                      transition: "all 0.2s",
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d={v.icon} />
                      </svg>
                      {v.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div style={{
                padding: "80px 0", textAlign: "center",
                fontFamily: "var(--mono)", fontSize: 12, color: T.textTer, letterSpacing: "0.08em",
              }}>LOADING…</div>
            ) : filtered.length === 0 ? (
              <div style={{
                padding: "80px 0", textAlign: "center",
                fontFamily: "var(--mono)", fontSize: 12, color: T.textTer, letterSpacing: "0.08em",
              }}>NO MATCHES · CLEAR FILTERS TO RESET</div>
            ) : view === "grid" ? (
              <div className="projects-archive-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18,
              }}>
                {filtered.map((p, i) => <ProjectCard key={p.id} T={T} p={p} idx={i} />)}
              </div>
            ) : (
              <div style={{
                border: `0.5px solid ${T.border}`, borderRadius: 12,
                overflow: "hidden", background: T.bg2,
              }}>
                {filtered.map((p, i) => (
                  <ProjectRow key={p.id} T={T} p={p} i={i} isLast={i === filtered.length - 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ap-pulseRing {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @media (max-width: 1024px) {
          .projects-archive-shell { padding: 40px 32px 60px !important; }
          .projects-archive-layout { grid-template-columns: 1fr !important; }
          .projects-archive-sidebar { position: static !important; }
        }
        @media (max-width: 700px) {
          .projects-archive-shell { padding: 32px 20px 48px !important; }
          .projects-archive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
