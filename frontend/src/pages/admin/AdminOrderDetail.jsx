import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CreditCard, Clock, Save } from 'lucide-react';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrder(id);
      const o = res.order || res;
      setOrder(o);
      setNewStatus(o.status || 'Pending');
    } catch (err) {
      console.error('Failed to load admin order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      await orderService.updateOrderStatus(id, newStatus, statusNote || `Status updated to ${newStatus} by Admin`);
      setMessage({ type: 'success', text: `Order status updated to ${newStatus}.` });
      setStatusNote('');
      await fetchOrder();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to update order status.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading order details..." />;
  if (!order) return <div className="container">Order not found.</div>;

  const addr = order.shippingAddress || {};
  const items = order.items || [];
  const history = order.statusHistory || [];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem', maxWidth: '840px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Orders List
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Manage Order #{order.orderNumber}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Customer: {order.user?.name || addr.fullName} ({order.user?.email || 'N/A'})
          </p>
        </div>
        <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
          Current: {order.status}
        </span>
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Update Status Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Update Fulfillment State</h2>
          <form onSubmit={handleUpdateStatus} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Fulfillment Status
              </label>
              <select
                className="input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Status Note / Tracking Number
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Dispatched via FedEx Tracking #FDX9921"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>

            <button type="submit" disabled={updating} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>
              {updating ? 'Saving...' : 'Apply Update'}
            </button>
          </form>
        </div>

        {/* Shipping & Payment Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--primary)" /> Destination
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>{addr.fullName}</strong><br />
              {addr.phone && <>Phone: {addr.phone}<br /></>}
              {addr.street}<br />
              {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--primary)" /> Payment & Settlement
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>Method:</strong> {order.paymentMethod || 'Razorpay'}<br />
              <strong>Payment Status:</strong> <span className="badge badge-success">{order.paymentStatus || 'Paid'}</span><br />
              {order.paymentResult?.id && <><strong>Tx ID:</strong> {order.paymentResult.id}<br /></>}
              <strong>Total Settled:</strong> ${order.totalPrice?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Ordered Inventory</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {it.image && <img src={it.image} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '6px' }} />}
                  <span>{it.name} (x{it.quantity})</span>
                </div>
                <strong>${(it.price * it.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
