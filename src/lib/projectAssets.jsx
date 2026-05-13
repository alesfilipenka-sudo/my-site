/* React-компоненты для секций Projects, Cases. Только компоненты —
 * react-refresh требует чтобы файл с экспортами компонентов не содержал ничего другого.
 * Константы в ./projectIcons.js. */

export function AnalyticalDot({ size = 8, color, pulse = false, style }) {
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

export function Tag({ children, T, accent }) {
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
