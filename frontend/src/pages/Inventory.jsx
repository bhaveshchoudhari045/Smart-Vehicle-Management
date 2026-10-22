import { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, PackagePlus, Search, ShoppingCart } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import Modal from '../components/Modal.jsx';
import { Badge, EmptyState, ErrorState, PageHeader, Spinner, stockTone } from '../components/ui.jsx';
import { STOCK_LABEL } from '../format.js';

export default function Inventory() {
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = user.role === 'SHOWROOM';
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [showroom, setShowroom] = useState('All');
  const [action, setAction] = useState(null); // { kind: 'delivery' | 'sale', item }

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await api.inventory());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showrooms = useMemo(() => ['All', ...new Set((rows || []).map((r) => r.showroom))], [rows]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows || []).filter(
      (r) => (showroom === 'All' || r.showroom === showroom) && (!needle || r.vehicleName.toLowerCase().includes(needle))
    );
  }, [rows, q, showroom]);

  const totals = useMemo(() => {
    const list = filtered;
    return {
      units: list.reduce((n, r) => n + r.quantity, 0),
      low: list.filter((r) => r.status === 'LOW_STOCK').length,
      out: list.filter((r) => r.status === 'OUT_OF_STOCK').length,
    };
  }, [filtered]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Spinner label="Loading inventory..." />;

  return (
    <>
      <PageHeader
        eyebrow={canEdit ? 'Showroom' : 'Manufacturer view'}
        title="Inventory"
        subtitle={canEdit ? 'Confirm deliveries and record sales to keep stock accurate.' : 'Read-only view of stock held by showrooms.'}
      />

      <div className="chips">
        <div className="chip"><strong>{totals.units}</strong> units shown</div>
        <div className="chip chip-warn"><strong>{totals.low}</strong> low stock</div>
        <div className="chip chip-bad"><strong>{totals.out}</strong> out of stock</div>
      </div>

      <div className="filters card">
        <div className="input-wrap grow">
          <Search size={17} />
          <input placeholder="Search vehicle..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select value={showroom} onChange={(e) => setShowroom(e.target.value)} aria-label="Showroom">
          {showrooms.map((s) => <option key={s} value={s}>{s === 'All' ? 'All showrooms' : s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No inventory found" text="Try another search or showroom." />
      ) : (
        <div className="card table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th><th>Showroom</th><th className="num">Available</th><th className="num">Sold</th><th>Status</th>
                  {canEdit && <th className="right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="cell-vehicle">
                        <VehicleImage vehicle={r} className="thumb" />
                        <div><strong>{r.vehicleName}</strong><span className="muted">{r.category}</span></div>
                      </div>
                    </td>
                    <td>{r.showroom}</td>
                    <td className="num"><strong>{r.quantity}</strong></td>
                    <td className="num">{r.soldCount}</td>
                    <td><Badge tone={stockTone(r.status)}>{STOCK_LABEL[r.status]}</Badge></td>
                    {canEdit && (
                      <td className="right nowrap">
                        <button className="btn btn-ghost btn-sm" onClick={() => setAction({ kind: 'delivery', item: r })}>
                          <PackagePlus size={15} /> Delivery
                        </button>
                        <button className="btn btn-ghost btn-sm" disabled={r.quantity === 0} onClick={() => setAction({ kind: 'sale', item: r })}>
                          <ShoppingCart size={15} /> Sale
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {action && (
        <QuantityModal
          kind={action.kind}
          item={action.item}
          onClose={() => setAction(null)}
          onDone={(msg) => {
            toast.success(msg);
            setAction(null);
            load();
          }}
        />
      )}
    </>
  );
}

function QuantityModal({ kind, item, onClose, onDone }) {
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isSale = kind === 'sale';

  async function submit(e) {
    e.preventDefault();
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1) return setError('Enter a whole number of at least 1.');
    if (isSale && n > item.quantity) return setError(`Only ${item.quantity} unit(s) in stock.`);
    setBusy(true);
    setError('');
    try {
      if (isSale) await api.recordSale(item.id, n);
      else await api.receiveDelivery(item.id, n);
      onDone(isSale ? `Sale recorded: ${n} x ${item.vehicleName}.` : `Delivery confirmed: ${n} x ${item.vehicleName}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={isSale ? 'Record a sale' : 'Confirm a delivery'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <p className="muted">{item.vehicleName} - {item.showroom} (currently {item.quantity} in stock)</p>
        <label className="field">
          <span>{isSale ? 'Units sold' : 'Units received'}</span>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} autoFocus />
        </label>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : isSale ? 'Record sale' : 'Confirm delivery'}</button>
        </div>
      </form>
    </Modal>
  );
}
