import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Banknote, Car, CheckCircle2, ChevronRight, MessageSquare, Package, ShoppingBag, Users } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import BarChart from '../components/BarChart.jsx';
import { Badge, EmptyState, ErrorState, PageHeader, Spinner, enquiryTone } from '../components/ui.jsx';
import { ENQUIRY_STATUS_LABEL, ENQUIRY_TYPE_LABEL, inrShort, timeAgo } from '../format.js';

function Stat({ icon: Icon, label, value, hint, tone = 'accent' }) {
  return (
    <div className={`stat stat-${tone}`}>
      <div className="stat-icon"><Icon size={20} /></div>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isCustomer = user.role === 'CUSTOMER';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setData(null);
    try {
      const [summary, vehicles, enquiries] = await Promise.all([api.dashboard(), api.vehicles(), api.enquiries()]);
      setData({ summary, vehicles, enquiries });
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Spinner label="Loading your dashboard..." />;

  const { summary: s, vehicles, enquiries } = data;
  const recentVehicles = vehicles.slice(0, 4);
  const recentEnquiries = enquiries.slice(0, 5);
  const chartData = isCustomer ? s.vehiclesByCategory : s.stockByCategory;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user.fullName.split(' ')[0]}`}
        subtitle={
          isCustomer
            ? 'Browse the latest vehicles and track your enquiries.'
            : 'Here is what is happening across vehicles, stock and enquiries.'
        }
      />

      <div className="stats">
        <Stat icon={Car} label="Vehicles listed" value={s.totalVehicles} hint={`${s.availableVehicles} open for orders`} />
        {isCustomer ? (
          <>
            <Stat icon={MessageSquare} label="My enquiries" value={s.enquiriesTotal} hint="Total submitted" tone="pink" />
            <Stat icon={CheckCircle2} label="In progress" value={s.enquiriesOpen} hint="New or being handled" tone="lav" />
          </>
        ) : (
          <>
            <Stat icon={Package} label="Units in stock" value={s.totalStock} hint={`${s.lowStockLines} low or empty lines`} tone="pink" />
            <Stat icon={MessageSquare} label="Open enquiries" value={s.enquiriesOpen} hint={`${s.enquiriesTotal} in total`} tone="lav" />
            <Stat icon={ShoppingBag} label="Units sold" value={s.unitsSold} hint="Recorded by showrooms" />
            <Stat icon={Banknote} label="Stock value" value={inrShort(s.stockValue)} hint="At listed prices" tone="pink" />
            <Stat icon={Users} label="Customers" value={s.customers} hint="Registered accounts" tone="lav" />
          </>
        )}
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <div>
              <h3>{isCustomer ? 'Vehicles by category' : 'Stock by category'}</h3>
              <p className="muted">{isCustomer ? 'Number of models in each segment' : 'Units available across all showrooms'}</p>
            </div>
          </div>
          <BarChart data={chartData} unit={isCustomer ? '' : ' units'} />
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <h3>{isCustomer ? 'My recent enquiries' : 'Recent enquiries'}</h3>
              <p className="muted">Latest activity</p>
            </div>
            <Link to="/enquiries" className="link-more">View all <ChevronRight size={15} /></Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No enquiries yet" text={isCustomer ? 'Open the catalogue and send your first enquiry.' : 'New customer enquiries will appear here.'} />
          ) : (
            <ul className="activity">
              {recentEnquiries.map((e) => (
                <li key={e.id}>
                  <div className="activity-dot" />
                  <div className="activity-main">
                    <strong>{e.vehicleName}</strong>
                    <span>{isCustomer ? ENQUIRY_TYPE_LABEL[e.type] : `${e.customerName} - ${ENQUIRY_TYPE_LABEL[e.type]}`}</span>
                  </div>
                  <div className="activity-side">
                    <Badge tone={enquiryTone(e.status)}>{ENQUIRY_STATUS_LABEL[e.status]}</Badge>
                    <span>{timeAgo(e.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Recently added vehicles</h2>
          <Link to="/catalogue" className="link-more">Open catalogue <ChevronRight size={15} /></Link>
        </div>
        {recentVehicles.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No vehicles yet" text="Vehicles added by the manufacturer will appear here." />
        ) : (
          <div className="mini-grid">
            {recentVehicles.map((v) => (
              <Link key={v.id} to="/catalogue" className="mini-card">
                <VehicleImage vehicle={v} className="mini-img" />
                <div className="mini-body">
                  <span className="muted">{v.brand}</span>
                  <strong>{v.model}</strong>
                  <span className="price">{inrShort(v.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
