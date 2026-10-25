import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package,
  PackagePlus,
  Search,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import VehicleImage from "../components/VehicleImage.jsx";
import Modal from "../components/Modal.jsx";
import {
  Badge,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  stockTone,
} from "../components/ui.jsx";
import { STOCK_LABEL } from "../format.js";

const STATUS_LABEL = {
  REQUESTED: "Requested",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
};

function requestTone(status) {
  if (status === "DELIVERED") return "good";
  if (status === "REJECTED") return "bad";
  if (status === "DISPATCHED") return "warn";
  return "neutral";
}

export default function Inventory() {
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = user.role === "SHOWROOM";
  const isManufacturer = user.role === "MANUFACTURER";
  const [rows, setRows] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [showroom, setShowroom] = useState("All");
  const [action, setAction] = useState(null);
  const [busyRequest, setBusyRequest] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const inventoryPromise = api.inventory();
      const requestsPromise =
        user.role === "MANUFACTURER" || user.role === "SHOWROOM"
          ? api.supplyRequests()
          : Promise.resolve([]);

      const [inventoryRows, requestRows] = await Promise.all([
        inventoryPromise,
        requestsPromise,
      ]);

      setRows(inventoryRows);
      setRequests(requestRows || []);
    } catch (e) {
      setError(e.message);
    }
  }, [user.role]);

  useEffect(() => {
    load();
  }, [load]);

  const showrooms = useMemo(
    () => ["All", ...new Set((rows || []).map((r) => r.showroom))],
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows || []).filter(
      (r) =>
        (showroom === "All" || r.showroom === showroom) &&
        (!needle || r.vehicleName.toLowerCase().includes(needle)),
    );
  }, [rows, q, showroom]);

  const totals = useMemo(
    () => ({
      units: filtered.reduce((n, r) => n + r.quantity, 0),
      low: filtered.filter((r) => r.status === "LOW_STOCK").length,
      out: filtered.filter((r) => r.status === "OUT_OF_STOCK").length,
    }),
    [filtered],
  );

  async function runRequestAction(request, operation, successMessage) {
    setBusyRequest(request.id);
    try {
      await operation(request.id);
      toast.success(successMessage);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyRequest(null);
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Spinner label="Loading inventory..." />;

  return (
    <>
      <PageHeader
        eyebrow={
          canEdit ? "Showroom" : isManufacturer ? "Manufacturer" : "Inventory"
        }
        title="Inventory"
        subtitle={
          canEdit
            ? "Request stock, confirm dispatched deliveries, and record sales."
            : isManufacturer
              ? "Monitor showroom stock and manage incoming supply requests."
              : "View available stock across showrooms."
        }
      />

      <div className="chips">
        <div className="chip">
          <strong>{totals.units}</strong> units shown
        </div>
        <div className="chip chip-warn">
          <strong>{totals.low}</strong> low stock
        </div>
        <div className="chip chip-bad">
          <strong>{totals.out}</strong> out of stock
        </div>
      </div>

      <div className="filters card">
        <div className="input-wrap grow">
          <Search size={17} />
          <input
            placeholder="Search vehicle..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {isManufacturer && (
          <select
            value={showroom}
            onChange={(e) => setShowroom(e.target.value)}
            aria-label="Showroom"
          >
            {showrooms.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All showrooms" : s}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory found"
          text="Try another search or showroom."
        />
      ) : (
        <div className="card table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Showroom</th>
                  <th className="num">Available</th>
                  <th className="num">Sold</th>
                  <th>Status</th>
                  {canEdit && <th className="right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="cell-vehicle">
                        <VehicleImage vehicle={r} className="thumb" />
                        <div>
                          <strong>{r.vehicleName}</strong>
                          <span className="muted">{r.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>{r.showroom}</td>
                    <td className="num">
                      <strong>{r.quantity}</strong>
                    </td>
                    <td className="num">{r.soldCount}</td>
                    <td>
                      <Badge tone={stockTone(r.status)}>
                        {STOCK_LABEL[r.status]}
                      </Badge>
                    </td>
                    {canEdit && (
                      <td className="right nowrap">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setAction({ kind: "request", item: r })
                          }
                        >
                          <PackagePlus size={15} /> Request stock
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={r.quantity < 1}
                          onClick={() => setAction({ kind: "sale", item: r })}
                        >
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

      <section className="section">
        <PageHeader
          eyebrow="Supply workflow"
          title="Supply requests"
          subtitle={
            canEdit
              ? "Track requests and confirm delivery only after the manufacturer dispatches them."
              : "Accept, reject, and dispatch showroom stock requests."
          }
        />

        {requests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No supply requests yet"
            text={
              canEdit
                ? "Use Request stock beside a vehicle to get started."
                : "New showroom requests will appear here."
            }
          />
        ) : (
          <div className="card table-card">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Showroom</th>
                    <th className="num">Quantity</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="cell-vehicle">
                          <VehicleImage
                            vehicle={{
                              imageUrl: r.imageUrl,
                              vehicleName: r.vehicleName,
                            }}
                            className="thumb"
                          />
                          <div>
                            <strong>{r.vehicleName}</strong>
                            <span className="muted">Request #{r.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{r.showroomName}</td>
                      <td className="num">{r.quantity}</td>
                      <td>
                        <Badge tone={requestTone(r.status)}>
                          {STATUS_LABEL[r.status] || r.status}
                        </Badge>
                      </td>
                      <td>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="right nowrap">
                        {isManufacturer && r.status === "REQUESTED" && (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={busyRequest === r.id}
                              onClick={() =>
                                runRequestAction(
                                  r,
                                  api.acceptSupplyRequest,
                                  "Supply request accepted.",
                                )
                              }
                            >
                              <CheckCircle size={15} /> Accept
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={busyRequest === r.id}
                              onClick={() =>
                                runRequestAction(
                                  r,
                                  api.rejectSupplyRequest,
                                  "Supply request rejected.",
                                )
                              }
                            >
                              <XCircle size={15} /> Reject
                            </button>
                          </>
                        )}
                        {isManufacturer && r.status === "ACCEPTED" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            disabled={busyRequest === r.id}
                            onClick={() =>
                              runRequestAction(
                                r,
                                api.dispatchSupplyRequest,
                                "Supply request marked as dispatched.",
                              )
                            }
                          >
                            <Truck size={15} /> Dispatch
                          </button>
                        )}
                        {canEdit && r.status === "DISPATCHED" && (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={busyRequest === r.id}
                            onClick={() =>
                              runRequestAction(
                                r,
                                api.confirmSupplyDelivery,
                                "Delivery confirmed and stock updated.",
                              )
                            }
                          >
                            <CheckCircle size={15} /> Confirm delivery
                          </button>
                        )}
                        {((isManufacturer &&
                          !["REQUESTED", "ACCEPTED"].includes(r.status)) ||
                          (canEdit && r.status !== "DISPATCHED")) && (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {action && (
        <QuantityModal
          kind={action.kind}
          item={action.item}
          onClose={() => setAction(null)}
          onDone={async (message) => {
            toast.success(message);
            setAction(null);
            await load();
          }}
        />
      )}
    </>
  );
}

function QuantityModal({ kind, item, onClose, onDone }) {
  const [qty, setQty] = useState("1");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSale = kind === "sale";

  async function submit(e) {
    e.preventDefault();
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1 || n > 1000) {
      setError("Enter a whole number between 1 and 1000.");
      return;
    }
    if (isSale && n > item.quantity) {
      setError(`Only ${item.quantity} unit(s) in stock.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isSale) {
        await api.recordSale(item.id, n);
        await onDone(`Sale recorded: ${n} x ${item.vehicleName}.`);
      } else {
        await api.createSupplyRequest(item.vehicleId, n);
        await onDone(`Supply request created: ${n} x ${item.vehicleName}.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={isSale ? "Record a sale" : "Request stock"} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <p className="muted">
          {item.vehicleName} — {item.showroom} (currently {item.quantity} in
          stock)
        </p>
        <label className="field">
          <span>{isSale ? "Units sold" : "Units requested"}</span>
          <input
            type="number"
            min="1"
            max="1000"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            autoFocus
          />
        </label>
        {!isSale && (
          <p className="muted">
            The showroom stock increases only after you confirm a dispatched
            delivery.
          </p>
        )}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving..." : isSale ? "Record sale" : "Submit request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
