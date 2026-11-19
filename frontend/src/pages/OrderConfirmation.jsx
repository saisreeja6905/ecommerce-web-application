import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Home } from 'lucide-react';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(id)
      .then((res) => {
        setOrder(res.order || res);
      })
      .catch((err) => {
        console.error('Error fetching order confirmation:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Generating order confirmation..." />;

  const addr = order?.shippingAddress || {};
  const items = order?.items || [];

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '720px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
      }}>
        {/* Success Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <CheckCircle2 size={44} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Payment & Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Thank you for choosing ApexStore. Your order has been verified and sent for fulfillment.
        </p>

        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'inline-flex',
          gap: '1.5rem',
          marginBottom: '2rem',
          fontSize: '0.9rem',
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Order Reference</span>
            <strong>{order?.orderNumber || id}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Payment Status</span>
            <span className="badge badge-success">{order?.paymentStatus?.toUpperCase() || 'PAID'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Fulfillment Status</span>
            <span className="badge badge-primary">{order?.status?.toUpperCase() || 'PROCESSING'}</span>
          </div>
        </div>

        {/* Shipping details */}
        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={18} color="var(--primary)" /> Dispatched To:
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong>{addr.fullName}</strong><br />
            {addr.street}<br />
            {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
          </p>
        </div>

        {/* Items Summary */}
        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="var(--primary)" /> Order Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {it.image && (
                    <img src={it.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />
                  )}
                  <span>{it.name} (x{it.quantity})</span>
                </div>
                <span style={{ fontWeight: 600 }}>${(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
            <span>Total Paid</span>
            <span style={{ color: 'var(--primary)' }}>${order?.totalPrice?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to={`/orders/${order?._id || id}`} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Track in My Orders <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
            <Home size={16} /> Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
