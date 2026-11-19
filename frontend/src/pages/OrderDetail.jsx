import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Calendar,
  CreditCard,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrder(id);
      setOrder(res.order || res);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      setMessage(null);
      await orderService.cancelOrder(id, 'Customer requested cancellation from dashboard');
      setMessage({ type: 'success', text: 'Order was successfully cancelled.' });
      await fetchOrder();
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Could not cancel order at this fulfillment stage.',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading order tracking information..." />;
  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Order not found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const items = order.items || [];
  const history = order.statusHistory || [];
  const canCancel = ['pending', 'processing'].includes(order.status?.toLowerCase());

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem', maxWidth: '880px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to All Orders
        </Link>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Order #{order.orderNumber}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
            Status: {order.status?.toUpperCase()}
          </span>

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="btn btn-outline"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.85rem' }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Timeline Tracking */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary)" /> Tracking & Status Updates
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.length > 0 ? (
              history.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>{h.status}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(h.changedAt || h.date).toLocaleString()}
                    </span>
                    {h.note && <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{h.note}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Order status: {order.status}</p>
            )}
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--primary)" /> Delivery Address
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>{addr.fullName}</strong><br />
              {addr.phone && <>Phone: {addr.phone}<br /></>}
              {addr.street}<br />
              {addr.city}, {addr.state} {addr.zipCode}<br />
              {addr.country}
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--primary)" /> Payment Information
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>Method:</strong> {order.paymentMethod?.toUpperCase() || 'RAZORPAY TEST'}<br />
              <strong>Payment Status:</strong> <span className="badge badge-success">{order.paymentStatus || 'PAID'}</span><br />
              {order.paymentResult?.id && <><strong>Ref ID:</strong> {order.paymentResult.id}<br /></>}
              {order.paidAt && <><strong>Paid at:</strong> {new Date(order.paidAt).toLocaleDateString()}</>}
            </p>
          </div>
        </div>

        {/* Purchased Items List */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--primary)" /> Items in this Order ({items.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={it.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80'}
                  alt=""
                  style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{it.name}</span>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Qty: {it.quantity} x ${it.price?.toFixed(2)}
                  </span>
                </div>
                <strong style={{ fontSize: '1rem' }}>${(it.price * it.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '320px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Subtotal:</span>
              <span>${order.itemsPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Tax:</span>
              <span>${order.taxPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Shipping:</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              <span>Total Paid:</span>
              <span style={{ color: 'var(--primary)' }}>${order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
