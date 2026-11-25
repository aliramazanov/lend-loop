export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M12.5 23.5c4-2.5 7.5-7.4 7.5-12 0-2.4-1.3-3.5-2.8-3.5-2.6 0-4.2 3-4.2 8.5v3.6c0 2.8 1.6 4.4 4 4.4 1.7 0 3-.8 4-2"
        className="stroke-white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
