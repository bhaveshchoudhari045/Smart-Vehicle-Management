import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import VehicleImage from "../components/VehicleImage.jsx";
import {
  Badge,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  enquiryTone,
} from "../components/ui.jsx";
import {
  ENQUIRY_STATUS_LABEL,
  ENQUIRY_TYPE_LABEL,
  formatDate,
} from "../format.js";

const STATUSES = ["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function Enquiries() {
  const { user } = useAuth();
  const toast = useToast();
  const isStaff = user.role !== "CUSTOMER";
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("ALL");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      setRows(await api.enquiries());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { ALL: (rows || []).length };
    STATUSES.forEach(
      (s) => (c[s] = (rows || []).filter((r) => r.status === s).length),
    );
    return c;
  }, [rows]);

  async function changeStatus(row, status) {
    if (status === row.status) return;

    let availability = null;
    let showroomResponse = "";
    let expectedWait = "";

    if (status === "IN_PROGRESS" || status === "COMPLETED") {
      const availabilityInput = window.prompt(
        "Vehicle availability: AVAILABLE, WAITING, NOT_AVAILABLE, or PENDING",
        row.availability || "PENDING",
      );

      if (availabilityInput === null) return;

      availability = availabilityInput.trim().toUpperCase();

      const allowedAvailability = [
        "AVAILABLE",
        "WAITING",
        "NOT_AVAILABLE",
        "PENDING",
      ];

      if (!allowedAvailability.includes(availability)) {
        toast.error("Invalid availability. Please try again.");
        return;
      }

      showroomResponse =
        window.prompt(
          "Enter a message for the customer:",
          row.showroomResponse || "",
        ) ?? "";

      expectedWait =
        window.prompt(
          "Expected waiting time (optional):",
          row.expectedWait || "",
        ) ?? "";
    }

    setSavingId(row.id);

    try {
      const updated = await api.updateEnquiryStatus(row.id, {
        status,
        availability,
        showroomResponse,
        expectedWait,
      });

      setRows((list) => list.map((r) => (r.id === row.id ? updated : r)));

      toast.success(
        `Enquiry marked as ${ENQUIRY_STATUS_LABEL[status].toLowerCase()}.`,
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingId(null);
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Spinner label="Loading enquiries..." />;

  const visible = tab === "ALL" ? rows : rows.filter((r) => r.status === tab);

  return (
    <>
      <PageHeader
        eyebrow={isStaff ? "Customer requests" : "Your requests"}
        title={isStaff ? "Enquiries" : "My enquiries"}
        subtitle={
          isStaff
            ? "Purchase and test-drive enquiries from customers."
            : "Track the enquiries you have submitted."
        }
      />

      <div className="tabs" role="tablist">
        {["ALL", ...STATUSES].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "on" : ""}
            onClick={() => setTab(t)}
          >
            {t === "ALL" ? "All" : ENQUIRY_STATUS_LABEL[t]}{" "}
            <span>{counts[t]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries here"
          text={
            isStaff
              ? "Nothing in this status right now."
              : "Browse the catalogue and send an enquiry to get started."
          }
          action={
            !isStaff && (
              <Link to="/catalogue" className="btn btn-primary">
                Browse catalogue
              </Link>
            )
          }
        />
      ) : (
        <div className="card table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  {isStaff && <th>Customer</th>}
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    {isStaff && (
                      <td>
                        <div className="stack">
                          <strong>{r.customerName}</strong>
                          <span className="muted">{r.customerEmail}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="cell-vehicle">
                        <VehicleImage vehicle={r} className="thumb" />
                        <div>
                          <strong>{r.vehicleName}</strong>
                          {r.message && (
                            <span className="muted clamp" title={r.message}>
                              {r.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{ENQUIRY_TYPE_LABEL[r.type]}</td>
                    <td className="nowrap">{formatDate(r.createdAt)}</td>
                    <td>
                      {isStaff ? (
                        <select
                          className={`status-select tone-${enquiryTone(r.status)}`}
                          value={r.status}
                          disabled={savingId === r.id}
                          onChange={(e) => changeStatus(r, e.target.value)}
                          aria-label="Update status"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {ENQUIRY_STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge tone={enquiryTone(r.status)}>
                          {ENQUIRY_STATUS_LABEL[r.status]}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
