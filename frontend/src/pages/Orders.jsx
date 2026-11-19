import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = statusFilter !== 'all' ? { status: statusFilter } : {};
        const res = await orderService.getMyOrders(params);
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="badge badge-success">Delivered</span>;
      case 'shipped':
        return <span className="badge badge-info">In Transit</span>;
      case 'processing':
        return <span className="badge badge-primary">Processing</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-warning">Pending Payment</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>My Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Track previous transactions, fulfillment timelines, and digital invoices.
          </p>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching order history..." />
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((ord) => {
            const firstItem = (ord.items && ord.items[0]) || {};
            const itemCount = (ord.items || []).reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={ord._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
                  alignItems: 'center',
                  gap: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                    Order Number
                  </span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {ord.orderNumber}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Placed on {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                    Total Amount
                  </span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                    ${ord.totalPrice?.toFixed(2)}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Status
                  </span>
                  {getStatusBadge(ord.status)}
                </div>

                <div>
                  <Link
                    to={`/orders/${ord._id}`}
                    className="btn btn-outline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem' }}
                  >
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px dashed var(--border)',
        }}>
          <Package size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You haven't placed any orders matching this status filter yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Store Catalog
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
