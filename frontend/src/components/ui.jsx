import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="state state-loading" role="status">
      <Loader2 className="spin" size={28} />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="state">
      {Icon && (
        <div className="state-icon">
          <Icon size={26} />
        </div>
      )}
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <h4>Something went wrong</h4>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function enquiryTone(status) {
  return { NEW: 'info', IN_PROGRESS: 'warn', COMPLETED: 'good', CANCELLED: 'bad' }[status] || 'neutral';
}

export function stockTone(status) {
  return { IN_STOCK: 'good', LOW_STOCK: 'warn', OUT_OF_STOCK: 'bad' }[status] || 'neutral';
}
