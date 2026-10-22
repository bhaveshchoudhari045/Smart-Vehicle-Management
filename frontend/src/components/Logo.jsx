export default function Logo({ size = 38, showText = true }) {
  return (
    <div className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="var(--logo-bg)" />
        <path
          d="M10 41c0-5 4-8 10-9l9-9c2-2 4-3 7-3h8c3 0 6 2 8 5l4 6c3 1 5 3 5 6v3H10z"
          fill="var(--logo-fg)"
        />
        <path d="M24 30l6-6h8l5 6z" fill="var(--logo-bg)" opacity="0.55" />
        <circle cx="23" cy="45" r="5.5" fill="var(--logo-bg)" />
        <circle cx="47" cy="45" r="5.5" fill="var(--logo-bg)" />
        <circle cx="23" cy="45" r="2" fill="var(--logo-fg)" />
        <circle cx="47" cy="45" r="2" fill="var(--logo-fg)" />
      </svg>
      {showText && (
        <div className="logo-text">
          <span className="logo-name">AutoBridge</span>
          <span className="logo-tag">Lite</span>
        </div>
      )}
    </div>
  );
}
