/**
 * Marque : un nœud blockchain (hexagone, sommets = pairs) qui encadre un
 * checkmark — "un bloc de la chaîne, vérifié conforme". Les sommets sont
 * reliés par les arêtes de l'hexagone (le réseau) et portent chacun un nœud
 * (cercle), avec un pouls lumineux sur les trois sommets impairs.
 */
export function Logo({ size = 32, animated = true }: { size?: number; animated?: boolean }) {
  const gradientId = "logo-gradient";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-mark" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-cyan)" />
          <stop offset="55%" stopColor="var(--accent-violet)" />
          <stop offset="100%" stopColor="var(--accent-magenta)" />
        </linearGradient>
      </defs>
      <polygon
        points="24,4 40.78,14 40.78,34 24,44 7.22,34 7.22,14"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M15.5 24.5 L21 30 L33 17"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {[
        [24, 4],
        [40.78, 14],
        [40.78, 34],
        [24, 44],
        [7.22, 34],
        [7.22, 14],
      ].map(([cx, cy], i) => (
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
    </svg>
  );
}
