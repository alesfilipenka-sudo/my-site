import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../lib/tokens.js";
import { useTheme } from "../lib/theme.js";

/* Пункты меню. "Projects" ведёт на отдельную страницу /projects.
 * Остальные — anchor-секции на главной (#about, #expertise, #cases, #experience, #contact). */
const NAV_ITEMS = [
  { label: "Projects",   to: "/projects" },
  { label: "About",      hash: "about" },
  { label: "Expertise",  hash: "expertise" },
  { label: "Cases",      hash: "cases" },
  { label: "Experience", hash: "experience" },
  { label: "Contact",    hash: "contact" },
];

function SocialIcon({ kind, size = 14 }) {
  const p = {
    email:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    linkedin:  <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></>,
    telegram:  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>,
    sun:       <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    moon:      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
  }[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
  );
}

/* Общий navbar для Site и ProjectsPage. data — hero info для socials. */
export default function SiteHeader({ data = {} }) {
  const [dark, setDark] = useTheme();
  const T = tokens(dark);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu при смене страницы
  const lastPath = useRef(location.pathname);
  useEffect(() => {
    if (lastPath.current !== location.pathname) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileOpen(false);
      lastPath.current = location.pathname;
    }
  }, [location.pathname]);

  // scroll к anchor при загрузке /#hash (если только что navigate с другой страницы)
  useEffect(() => {
    if (isHome && location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [isHome, location.hash]);

  const handleNavClick = (item, e) => {
    if (item.to) return; // <Link>, react-router сам разрулит
    e?.preventDefault?.();
    setMobileOpen(false);
    if (isHome) {
      document.getElementById(item.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${item.hash}`);
    }
  };

  const hero = data?.hero || {};
  const hero_email     = hero.email     || "";
  const hero_linkedin  = hero.linkedin  || "";
  const hero_instagram = hero.instagram || "";
  const hero_telegram  = hero.telegram  || "";

  const socialBtn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, borderRadius: 6,
    color: T.textSec, border: `0.5px solid ${T.border}`,
    background: T.surface, transition: "color 0.2s, border-color 0.2s",
  };

  return (
    <>
      <style>{`
        .sh-link:hover, .sh-icon:hover { color: ${T.text} !important; border-color: ${T.borderMd} !important; }
        @media (max-width: 900px) {
          .sh-nav-desktop { display: none !important; }
          .sh-mobile-btn  { display: inline-flex !important; }
        }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? T.glass : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
        borderBottom: `0.5px solid ${scrolled ? T.border : "transparent"}`,
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16,
        }}>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "baseline",
            fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: T.text, textDecoration: "none",
          }}>
            <span style={{ color: T.textTer, fontSize: 14, marginRight: 1 }}>@</span>
            <span>ales</span>
            <span style={{ color: T.acc }}>f</span>
            <span>ilipenka</span>
          </Link>

          <div className="sh-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_ITEMS.filter(n => n.label !== "Contact").map((item, i) => {
              const label = (
                <>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.textTer, marginRight: 6 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </>
              );
              const baseStyle = {
                background: "none", border: "none", padding: "8px 12px",
                fontSize: 12.5, color: T.textSec, fontWeight: 500, borderRadius: 6,
                transition: "color 0.2s", textDecoration: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center",
              };
              return item.to
                ? <Link key={item.label} to={item.to} className="sh-link" style={baseStyle}>{label}</Link>
                : <button key={item.label} onClick={(e) => handleNavClick(item, e)} className="sh-link" style={baseStyle}>{label}</button>;
            })}

            <div style={{ width: 1, height: 16, background: T.border, margin: "0 8px" }} />

            {hero_email && <a href={`mailto:${hero_email}`} className="sh-icon" style={socialBtn} title="Email"><SocialIcon kind="email" /></a>}
            {hero_linkedin && <a href={hero_linkedin} target="_blank" rel="noreferrer" className="sh-icon" style={socialBtn} title="LinkedIn"><SocialIcon kind="linkedin" /></a>}
            {hero_instagram && <a href={hero_instagram} target="_blank" rel="noreferrer" className="sh-icon" style={socialBtn} title="Instagram"><SocialIcon kind="instagram" /></a>}
            {hero_telegram && <a href={hero_telegram} target="_blank" rel="noreferrer" className="sh-icon" style={socialBtn} title="Telegram"><SocialIcon kind="telegram" /></a>}

            <button onClick={() => setDark(!dark)} className="sh-icon" style={{ ...socialBtn, marginLeft: 4 }} title="Toggle theme">
              <SocialIcon kind={dark ? "sun" : "moon"} />
            </button>

            {isHome ? (
              <button onClick={(e) => handleNavClick({ hash: "contact" }, e)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 6, marginLeft: 4, border: "none", cursor: "pointer",
                  background: T.acc, color: T.bg, fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em",
                  boxShadow: `0 0 0 0.5px ${T.acc}, 0 4px 24px -8px rgba(${T.accGlow},0.6)`,
                }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.bg, opacity: 0.6 }} />
                Get in touch
              </button>
            ) : hero_email && (
              <a href={`mailto:${hero_email}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 6, marginLeft: 4, textDecoration: "none",
                  background: T.acc, color: T.bg, fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em",
                  boxShadow: `0 0 0 0.5px ${T.acc}, 0 4px 24px -8px rgba(${T.accGlow},0.6)`,
                }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.bg, opacity: 0.6 }} />
                Get in touch
              </a>
            )}
          </div>

          <button className="sh-mobile-btn" onClick={() => setMobileOpen(o => !o)}
            style={{
              display: "none", background: T.surface, border: `0.5px solid ${T.border}`,
              color: T.text, borderRadius: 6, padding: 8, alignItems: "center", justifyContent: "center",
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div style={{ background: T.bg2, borderTop: `0.5px solid ${T.border}`, padding: "12px 24px 18px" }}>
            {NAV_ITEMS.map(item => (
              item.to
                ? <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "12px 8px", borderBottom: `0.5px solid ${T.border}`,
                    fontSize: 14, color: T.text, fontWeight: 500, textDecoration: "none",
                  }}>{item.label}</Link>
                : <button key={item.label} onClick={(e) => handleNavClick(item, e)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "12px 8px", background: "none", border: "none",
                    borderBottom: `0.5px solid ${T.border}`, fontSize: 14, color: T.text, fontWeight: 500,
                  }}>{item.label}</button>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={() => setDark(!dark)} style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}>
                <SocialIcon kind={dark ? "sun" : "moon"} /> {dark ? "Light" : "Dark"} theme
              </button>
              {hero_email && <a href={`mailto:${hero_email}`} style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="email" /> Email</a>}
              {hero_linkedin && <a href={hero_linkedin} target="_blank" rel="noreferrer" style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="linkedin" /> LinkedIn</a>}
              {hero_instagram && <a href={hero_instagram} target="_blank" rel="noreferrer" style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="instagram" /> Instagram</a>}
              {hero_telegram && <a href={hero_telegram} target="_blank" rel="noreferrer" style={{ ...socialBtn, width: "auto", padding: "0 12px", height: 36, gap: 8, fontSize: 12 }}><SocialIcon kind="telegram" /> Telegram</a>}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
