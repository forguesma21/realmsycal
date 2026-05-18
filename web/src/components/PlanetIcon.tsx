type Props = { className?: string };

export function PlanetIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M4.5 8h15M4.5 16h15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
