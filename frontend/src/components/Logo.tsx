/**
 * Marque : trois blocs hexagonaux empilés en profondeur (la chaîne, vue de
 * biais) qui convergent vers un bloc de premier plan marqué d'un checkmark
 * ("le dernier bloc, vérifié conforme"). Une particule orbite en continu
 * autour du bloc avant — le réseau qui continue de tourner — et un halo
 * respire doucement derrière l'ensemble.
 */
export function Logo({ size = 32, animated = true }: { size?: number; animated?: boolean }) {
  const gradientId = "logo-gradient";
  const haloId = "logo-halo-gradient";
  const centerPivot = "translate(24 24) scale(SCALE) translate(-24 -24)";
  const hexPoints = "24,4 40.78,14 40.78,34 24,44 7.22,34 7.22,14";
  const vertices: [number, number][] = [
    [24, 4],
    [40.78, 14],
    [40.78, 34],
    [24, 44],
    [7.22, 34],
    [7.22, 14],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? "logo-mark logo-mark--animated" : "logo-mark"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-cyan)" />
          <stop offset="55%" stopColor="var(--accent-violet)" />
          <stop offset="100%" stopColor="var(--accent-magenta)" />
        </linearGradient>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent-violet)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="24" cy="24" r="23" fill={`url(#${haloId})`} className="logo-mark__halo" />

      {/* deux blocs en retrait, pour suggérer la profondeur de la chaîne */}
      <polygon
        points={hexPoints}
        transform={`translate(-6 -6) ${centerPivot.replace("SCALE", "0.58")}`}
        stroke="var(--accent-violet)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
        opacity="0.28"
      />
      <polygon
        points={hexPoints}
        transform={`translate(-3 -3) ${centerPivot.replace("SCALE", "0.79")}`}
        stroke="var(--accent-cyan)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />

      {/* bloc de premier plan, vérifié */}
      <polygon points={hexPoints} stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M15.5 24.5 L21 30 L33 17" stroke={`url(#${gradientId})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {vertices.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i % 2 === 0 ? 2.1 : 1.5}
          fill={i % 2 === 0 ? "var(--accent-cyan)" : "var(--accent-violet)"}
          className={animated ? "logo-mark__node" : undefined}
          style={animated ? { animationDelay: `${i * 0.35}s` } : undefined}
        />
      ))}

      {animated && <circle r="1.8" fill="var(--accent-magenta)" className="logo-mark__orbit" />}
    </svg>
  );
}
