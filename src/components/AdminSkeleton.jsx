/**
 * Скелетон админки (тёмный sidebar + светлый контент).
 * Повторяет реальный layout: 240px sidebar, 64px topbar, карточка с полями.
 */
export default function AdminSkeleton() {
  const SIDE   = "#0a0a0a";
  const SIDEBD = "#1a1a1a";
  const BG     = "#f5f5f7";
  const CARD   = "#ffffff";
  const BD     = "#e5e7eb";

  const Bone = ({ w, h, r = 6, dark, style }) => (
    <div className="sk-a-bone" data-dark={dark ? "1" : "0"} style={{
      width: w, height: h, borderRadius: r, ...style,
    }} />
  );

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: BG, fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes sk-a-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .sk-a-bone {
          background: linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.09) 50%, rgba(0,0,0,0.05) 100%);
          background-size: 200% 100%;
          animation: sk-a-shimmer 1.6s linear infinite;
        }
        .sk-a-bone[data-dark="1"] {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 100%);
          background-size: 200% 100%;
        }
      `}</style>

      {/* sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: SIDE,
        borderRight: `1px solid ${SIDEBD}`, display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "22px 22px 18px", borderBottom: `1px solid ${SIDEBD}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#378ADD", boxShadow: "0 0 12px #378ADD" }} />
          <Bone w={70} h={12} dark />
        </div>
        <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8,
              background: i === 0 ? "rgba(55,138,221,0.12)" : "transparent",
            }}>
              <Bone w={18} h={10} dark />
              <Bone w={i === 0 ? 78 : 60 + (i * 7) % 30} h={10} dark />
            </div>
          ))}
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* topbar */}
        <header style={{
          height: 64, flexShrink: 0, background: CARD, borderBottom: `1px solid ${BD}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Bone w={110} h={14} />
            <Bone w={80} h={20} r={999} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Bone w={88} h={36} r={8} />
            <Bone w={150} h={36} r={8} />
          </div>
        </header>

        {/* content */}
        <main style={{ flex: 1, overflowY: "hidden", padding: "32px 40px" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            {/* секция-заголовок */}
            <div style={{ marginBottom: 16 }}>
              <Bone w={24} h={10} style={{ marginBottom: 6 }} />
              <Bone w={140} h={24} style={{ marginBottom: 6 }} />
              <Bone w={300} h={12} />
            </div>

            {/* карточка с полями */}
            <div style={{
              background: CARD, border: `1px solid ${BD}`, borderRadius: 10,
              padding: 20, display: "flex", flexDirection: "column", gap: 18,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[0, 1].map(i => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Bone w={60} h={9} />
                    <Bone w="100%" h={36} r={8} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Bone w={70} h={9} />
                <Bone w="100%" h={72} r={8} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[0, 1].map(i => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Bone w={60} h={9} />
                    <Bone w="100%" h={36} r={8} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
