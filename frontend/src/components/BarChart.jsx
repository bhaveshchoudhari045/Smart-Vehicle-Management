/** Horizontal bar chart drawn with plain HTML/CSS. `data` is an object { label: value }. */
export default function BarChart({ data, unit = '' }) {
  const rows = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, v]) => v));

  if (rows.length === 0) return <p className="muted">No data to chart yet.</p>;

  return (
    <ul className="bars">
      {rows.map(([label, value], i) => (
        <li key={label}>
          <div className="bar-top">
            <span>{label}</span>
            <strong>
              {value}
              {unit}
            </strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(value / max) * 100}%`, animationDelay: `${i * 70}ms` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
