/**
 * Marque : un composant hexagonal façon puce (die) avec ses broches, tracé
 * comme un schéma technique — repères d'angle en coin (viseur de scan), via
 * point de jonction sur la piste, broches/pads en carré. Le checkmark
 * central est dessiné comme une piste de circuit (segments + via), pas une
 * coche organique. Un paquet carré orbite le long d'une piste circulaire
 * autour de la puce.
 */
export function Logo({ size = 32, animated = true }: { size?: number; animated?: boolean }) {
  const gradientId = "logo-gradient";
  const haloId = "logo-halo-gradient";

  const hexPoints = "24,11 35.26,17.5 35.26,30.5 24,37 12.74,30.5 12.74,17.5";
  const pins: { leg: [number, number, number, number]; pad: [number, number]; even: boolean }[] = [
    { leg: [24, 11, 24, 6], pad: [24, 4], even: true },
    { leg: [35.26, 17.5, 39.5, 15], pad: [41.32, 14], even: false },
    { leg: [35.26, 30.5, 39.5, 33], pad: [41.32, 34], even: true },
    { leg: [24, 37, 24, 42], pad: [24, 44], even: false },
    { leg: [12.74, 30.5, 8.5, 33], pad: [6.68, 34], even: true },
    { leg: [12.74, 17.5, 8.5, 15], pad: [6.68, 14], even: false },
  ];

  const corners: [number, number, number, number][] = [
    [3, 8, 3, 3],
    [3, 3, 8, 3],
    [45, 8, 45, 3],
    [45, 3, 40, 3],
    [3, 40, 3, 45],
    [3, 45, 8, 45],
    [45, 40, 45, 45],
    [45, 45, 40, 45],
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
          <stop offset="0%" stopColor="var(--accent-violet)" stopOpacity="0.65" />
          <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="24" cy="24" r="25" fill={`url(#${haloId})`} className="logo-mark__halo" />

      {/* repères de coin, façon viseur/scan technique */}
      {corners.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent-cyan)" strokeWidth="1.7" strokeLinecap="round" opacity="0.7" />
      ))}

      {/* broches : patte + pad carré, comme un boîtier de circuit intégré */}
      {pins.map(({ leg: [x1, y1, x2, y2], pad: [px, py], even }, i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={even ? "var(--accent-cyan)" : "var(--accent-violet)"} strokeWidth="2" opacity="0.95" />
          <rect
            x={px - 1.7}
            y={py - 1.7}
            width="3.4"
            height="3.4"
            rx="0.6"
            fill={even ? "var(--accent-cyan)" : "var(--accent-violet)"}
            className={animated ? "logo-mark__node" : undefined}
            style={animated ? { animationDelay: `${i * 0.32}s` } : undefined}
          />
        </g>
      ))}

      {/* corps de la puce */}
      <polygon points={hexPoints} stroke={`url(#${gradientId})`} strokeWidth="2.8" strokeLinejoin="round" fill="rgba(18, 24, 41, 0.94)" />
      {/* repère d'orientation (pin 1), comme sur un vrai boîtier CI */}
      <circle cx="16.5" cy="20" r="1.3" fill="var(--accent-gold)" />

      {/* checkmark rendu comme une piste de circuit : segment + via + segment */}
      <path d="M17.5 24.5 L21.5 28.5" stroke={`url(#${gradientId})`} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M21.5 28.5 L31 18" stroke={`url(#${gradientId})`} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <rect x="19.9" y="26.9" width="3.2" height="3.2" rx="0.6" fill="var(--bg-base)" stroke={`url(#${gradientId})`} strokeWidth="1.4" />

      {animated && <rect x="-1.5" y="-1.5" width="3" height="3" rx="0.8" fill="var(--accent-magenta)" className="logo-mark__orbit" />}
    </svg>
  );
}
