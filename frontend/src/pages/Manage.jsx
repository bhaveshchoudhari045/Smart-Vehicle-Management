import { useCallback, useEffect, useState } from 'react';
import { Car, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import Modal from '../components/Modal.jsx';
import { Badge, EmptyState, ErrorState, PageHeader, Spinner } from '../components/ui.jsx';
import { inrShort } from '../format.js';

const CATEGORIES = ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Luxury', 'Sports', 'Pickup'];
const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const TRANSMISSIONS = ['Manual', 'Automatic'];

const EMPTY = {
  brand: '',
  model: '',
  modelYear: new Date().getFullYear(),
  category: 'SUV',
  fuelType: 'Petrol',
  transmission: 'Manual',
  price: '',
  engine: '',
  description: '',
  imageUrl: '',
  available: true,
};

export default function Manage() {
  const toast = useToast();
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | vehicle
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setVehicles(await api.vehicles());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    try {
      await api.deleteVehicle(deleting.id);
      toast.success(`${deleting.brand} ${deleting.model} was deleted.`);
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!vehicles) return <Spinner label="Loading vehicles..." />;

  return (
    <>
      <PageHeader
        eyebrow="Manufacturer"
        title="Vehicle management"
        subtitle="Add, edit or remove the vehicles shown in the catalogue."
        actions={<button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={17} /> Add vehicle</button>}
      />

      {vehicles.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles yet" text="Add your first vehicle to build the catalogue."
          action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Add vehicle</button>} />
      ) : (
        <div className="card table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th><th>Category</th><th>Fuel</th><th>Price</th><th>Status</th><th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="cell-vehicle">
                        <VehicleImage vehicle={v} className="thumb" />
                        <div><strong>{v.brand} {v.model}</strong><span className="muted">{v.modelYear} - {v.transmission}</span></div>
                      </div>
                    </td>
                    <td>{v.category}</td>
                    <td>{v.fuelType}</td>
                    <td className="price">{inrShort(v.price)}</td>
                    <td><Badge tone={v.available ? 'good' : 'bad'}>{v.available ? 'Available' : 'Unavailable'}</Badge></td>
                    <td className="right">
                      <button className="icon-btn" title="Edit" aria-label="Edit vehicle" onClick={() => setEditing(v)}><Pencil size={17} /></button>
                      <button className="icon-btn danger" title="Delete" aria-label="Delete vehicle" onClick={() => setDeleting(v)}><Trash2 size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <VehicleForm
          vehicle={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            toast.success(msg);
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <Modal
          title="Delete vehicle?"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </>
          }
        >
          <p>
            This permanently removes <strong>{deleting.brand} {deleting.model}</strong>, together with its showroom
            stock entries and any customer enquiries about it.
          </p>
        </Modal>
      )}
    </>
  );
}

function VehicleForm({ vehicle, onClose, onSaved }) {
  const [form, setForm] = useState(vehicle ? { ...EMPTY, ...vehicle, imageUrl: vehicle.imageUrl || '', engine: vehicle.engine || '', description: vehicle.description || '' } : EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.brand.trim() || !form.model.trim()) return setError('Brand and model are required.');
    const price = Number(form.price);
    const year = Number(form.modelYear);
    if (!Number.isFinite(price) || price <= 0) return setError('Enter a price greater than zero.');
    if (!Number.isInteger(year) || year < 1990 || year > 2100) return setError('Enter a valid model year.');

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      modelYear: year,
      category: form.category,
      fuelType: form.fuelType,
      transmission: form.transmission,
      price: Math.round(price),
      engine: form.engine.trim() || null,
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      available: !!form.available,
    };

    setBusy(true);
    try {
      if (vehicle) {
        await api.updateVehicle(vehicle.id, payload);
        onSaved(`${payload.brand} ${payload.model} was updated.`);
      } else {
        await api.createVehicle(payload);
        onSaved(`${payload.brand} ${payload.model} was added.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={vehicle ? 'Edit vehicle' : 'Add vehicle'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="form-grid">
        <label className="field"><span>Brand</span><input value={form.brand} onChange={set('brand')} placeholder="e.g. Tata" /></label>
        <label className="field"><span>Model</span><input value={form.model} onChange={set('model')} placeholder="e.g. Nexon EV" /></label>
        <label className="field"><span>Model year</span><input type="number" value={form.modelYear} onChange={set('modelYear')} /></label>
        <label className="field"><span>Price (₹)</span><input type="number" min="1" value={form.price} onChange={set('price')} placeholder="e.g. 1500000" /></label>
        <label className="field"><span>Category</span>
          <select value={form.category} onChange={set('category')}>
            {[...new Set([...CATEGORIES, form.category])].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="field"><span>Fuel type</span>
          <select value={form.fuelType} onChange={set('fuelType')}>
            {[...new Set([...FUELS, form.fuelType])].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="field"><span>Transmission</span>
          <select value={form.transmission} onChange={set('transmission')}>
            {[...new Set([...TRANSMISSIONS, form.transmission])].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="field"><span>Engine / battery</span><input value={form.engine} onChange={set('engine')} placeholder="e.g. 1.5L turbo petrol" /></label>
        <label className="field span-2"><span>Image URL (optional)</span><input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." /></label>
        <label className="field span-2"><span>Description</span><textarea rows={3} maxLength={1000} value={form.description} onChange={set('description')} /></label>
        <label className="check span-2">
          <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} />
          <span>Available for new orders and enquiries</span>
        </label>

        {error && <div className="alert alert-error span-2" role="alert">{error}</div>}

        <div className="form-actions span-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : vehicle ? 'Save changes' : 'Add vehicle'}</button>
        </div>
      </form>
    </Modal>
  );
}
