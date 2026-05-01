import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth, login } from "../lib/auth";

const C = {
  bg: "#0a0a0a",
  card: "#111114",
  bd: "#1f1f23",
  tx: "#ffffff",
  txMu: "#a1a1aa",
  txDim: "#71717a",
  acc: "#378ADD",
  accD: "#185FA5",
  danger: "#dc2626",
};

/** Стильная страница логина: кнопка "Sign in with GitHub", без email/password. */
export default function Login() {
  const { loading, user } = useAuth();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/admin";
  const errorParam = params.get("error");

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      window.location.assign(returnTo);
    }
  }, [loading, user, returnTo]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, color: C.tx, fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      padding: "24px",
    }}>
      <style>{`
        @keyframes lg-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .lg-card  { animation: lg-fade-up 0.45s ease both; }
        .lg-btn   { transition: background 0.18s, box-shadow 0.18s, transform 0.18s; }
        .lg-btn:hover    { background: ${C.accD} !important; box-shadow: 0 0 24px rgba(55,138,221,0.3); }
        .lg-btn:active   { transform: translateY(1px); }
        .lg-back:hover   { color: ${C.tx} !important; }
      `}</style>

      <div className="lg-card" style={{
        width: "100%", maxWidth: 380,
        background: C.card, border: `1px solid ${C.bd}`,
        borderRadius: 14, padding: "32px 32px 28px",
        boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.acc, boxShadow: `0 0 12px ${C.acc}` }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", color: C.tx }}>ALES</span>
          <span style={{ fontSize: 11, letterSpacing: "1.5px", color: C.txMu }}>ADMIN</span>
        </div>

        <h1 style={{
          margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em",
          color: C.tx, lineHeight: 1.3,
        }}>Sign in to continue</h1>
        <p style={{
          margin: "8px 0 28px", fontSize: 13, color: C.txMu, lineHeight: 1.55,
        }}>
          Доступ к редактору контента имеют только указанные администраторы.
        </p>

        {errorParam && (
          <div style={{
            background: "rgba(220,38,38,0.08)", border: `1px solid ${C.danger}33`,
            color: "#fecaca", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 16,
          }}>
            {decodeURIComponent(errorParam)}
          </div>
        )}

        <button
          onClick={() => login(returnTo)}
          disabled={loading}
          className="lg-btn"
          style={{
            width: "100%", height: 44, padding: "0 16px",
            background: C.acc, color: "#fff",
            border: "none", borderRadius: 10,
            fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38s1.95.13 2.86.38c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
          </svg>
          Continue with GitHub
        </button>

        <div style={{
          marginTop: 22, fontSize: 12, color: C.txDim, lineHeight: 1.6,
        }}>
          После авторизации сервер проверит, что твой GitHub-логин в списке администраторов.
          Если нет — увидишь 403.
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.bd}` }}>
          <Link to="/" className="lg-back" style={{
            color: C.txMu, fontSize: 12, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
