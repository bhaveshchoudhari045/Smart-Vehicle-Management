import { useCallback, useEffect, useMemo, useState } from 'react';
import { Car, Cog, Fuel, Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import Modal from '../components/Modal.jsx';
import { Badge, EmptyState, ErrorState, PageHeader, Spinner } from '../components/ui.jsx';
import { inr, inrShort } from '../format.js';

const PRICE_BANDS = [
  { id: 'any', label: 'Any price', test: () => true },
  { id: 'u10', label: 'Under ₹10 L', test: (p) => p < 1000000 },
  { id: '10-20', label: '₹10 - 20 L', test: (p) => p >= 1000000 && p < 2000000 },
  { id: '20-50', label: '₹20 - 50 L', test: (p) => p >= 2000000 && p < 5000000 },
  { id: 'o50', label: 'Above ₹50 L', test: (p) => p >= 5000000 },
];

function Spec({ icon: Icon, children }) {
  return (
    <span className="spec">
      <Icon size={14} /> {children}
    </span>
  );
}

export default function Catalogue() {
  const { user } = useAuth();
  const toast = useToast();
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [fuel, setFuel] = useState('All');
  const [band, setBand] = useState('any');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setError('');
    setVehicles(null);
    try {
      setVehicles(await api.vehicles());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => ['All', ...new Set((vehicles || []).map((v) => v.category))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b))), [vehicles]);
  const fuels = useMemo(() => ['All', ...new Set((vehicles || []).map((v) => v.fuelType))], [vehicles]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const bandTest = PRICE_BANDS.find((b) => b.id === band).test;
    return (vehicles || []).filter(
      (v) =>
        (!needle || `${v.brand} ${v.model} ${v.category} ${v.fuelType}`.toLowerCase().includes(needle)) &&
        (category === 'All' || v.category === category) &&
        (fuel === 'All' || v.fuelType === fuel) &&
        bandTest(v.price)
    );
  }, [vehicles, q, category, fuel, band]);

  function reset() {
    setQ('');
    setCategory('All');
    setFuel('All');
    setBand('any');
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!vehicles) return <Spinner label="Loading vehicles..." />;

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Explore vehicles" subtitle={`${vehicles.length} models listed by manufacturers`} />

      <div className="filters card">
        <div className="input-wrap grow">
          <Search size={17} />
          <input placeholder="Search brand, model, fuel..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
        </select>
        <select value={fuel} onChange={(e) => setFuel(e.target.value)} aria-label="Fuel type">
          {fuels.map((f) => <option key={f} value={f}>{f === 'All' ? 'All fuel types' : f}</option>)}
        </select>
        <select value={band} onChange={(e) => setBand(e.target.value)} aria-label="Price range">
          {PRICE_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={reset}><SlidersHorizontal size={16} /> Reset</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles match your filters"
          text="Try a different search or clear the filters."
          action={<button className="btn btn-primary" onClick={reset}>Clear filters</button>}
        />
      ) : (
        <div className="vgrid">
          {filtered.map((v) => (
            <article key={v.id} className="vcard" onClick={() => setSelected(v)}>
              <div className="vcard-media">
                <VehicleImage vehicle={v} />
                <div className="vcard-badges">
                  <Badge tone={v.available ? 'good' : 'bad'}>{v.available ? 'Available' : 'Unavailable'}</Badge>
                </div>
              </div>
              <div className="vcard-body">
                <span className="muted">{v.brand} - {v.modelYear}</span>
                <h3>{v.model}</h3>
                <div className="specs">
                  <Spec icon={Fuel}>{v.fuelType}</Spec>
                  <Spec icon={Cog}>{v.transmission}</Spec>
                  <Spec icon={Car}>{v.category}</Spec>
                </div>
                <div className="vcard-foot">
                  <span className="price">{inrShort(v.price)}</span>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(v); }}>Details</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <VehicleModal
          vehicle={selected}
          canEnquire={user.role === 'CUSTOMER'}
          onClose={() => setSelected(null)}
          onSent={() => {
            toast.success('Enquiry sent. You can track it under My enquiries.');
            setSelected(null);
          }}
        />
      )}
    </>
  );
}

function VehicleModal({ vehicle: v, canEnquire, onClose, onSent }) {
  const toast = useToast();
  const [type, setType] = useState('TEST_DRIVE');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createEnquiry({ vehicleId: v.id, type, message: message.trim() || null });
      onSent();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`${v.brand} ${v.model}`} onClose={onClose} wide>
      <div className="detail">
        <VehicleImage vehicle={v} className="detail-img" />
        <div>
          <div className="detail-top">
            <span className="price price-lg">{inr.format(v.price)}</span>
            <Badge tone={v.available ? 'good' : 'bad'}>{v.available ? 'Available' : 'Unavailable'}</Badge>
          </div>
          <p className="muted">{v.description || 'No description provided.'}</p>
          <dl className="facts">
            <div><dt>Year</dt><dd>{v.modelYear}</dd></div>
            <div><dt>Category</dt><dd>{v.category}</dd></div>
            <div><dt>Fuel</dt><dd>{v.fuelType}</dd></div>
            <div><dt>Transmission</dt><dd>{v.transmission}</dd></div>
            <div><dt>Engine / battery</dt><dd>{v.engine || '-'}</dd></div>
          </dl>
        </div>
      </div>

      {canEnquire ? (
        v.available ? (
          <form className="enquiry-form" onSubmit={send}>
            <h4>Send an enquiry</h4>
            <div className="segmented">
              <button type="button" className={type === 'TEST_DRIVE' ? 'on' : ''} onClick={() => setType('TEST_DRIVE')}>Test drive</button>
              <button type="button" className={type === 'PURCHASE' ? 'on' : ''} onClick={() => setType('PURCHASE')}>Purchase</button>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Add a note (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Submit enquiry'}</button>
          </form>
        ) : (
          <div className="alert alert-warn">This vehicle is not currently open for new enquiries.</div>
        )
      ) : (
        <div className="alert alert-info">Enquiries can be submitted by customer accounts.</div>
      )}
    </Modal>
  );
}
