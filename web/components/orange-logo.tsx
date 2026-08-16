/** The Orange mark — a rotated orange-slice arc with a signal-colored pip.
 *  Single canonical logo (the SVG one from the design), used app-wide. */
export function OrangeLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden>
      <g transform="rotate(-20 48 48)">
        <path
          d="M 72.43 39.11 A 26 26 0 1 0 72.43 56.89"
          fill="none"
          stroke="var(--o-accent)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle cx="88" cy="48" r="7" style={{ fill: "var(--o-ink)" }} />
      </g>
    </svg>
  );
}
