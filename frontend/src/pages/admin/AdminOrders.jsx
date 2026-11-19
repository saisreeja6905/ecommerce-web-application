import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await orderService.getAllOrders(params);
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus, `Status updated by Admin to ${newStatus}`);
      setMessage({ type: 'success', text: `Order status changed to ${newStatus}.` });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      setMessage({ type: 'danger', text: 'Could not update order status.' });
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Customer Orders Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {orders.length} total orders across customer base
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {loading ? (
        <LoadingSpinner text="Retrieving orders ledger..." />
      ) : orders.length > 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Order Ref</th>
                  <th style={{ padding: '1rem' }}>Customer Name</th>
                  <th style={{ padding: '1rem' }}>Date Placed</th>
                  <th style={{ padding: '1rem' }}>Total Amount</th>
                  <th style={{ padding: '1rem' }}>Payment Status</th>
                  <th style={{ padding: '1rem' }}>Fulfillment Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{ord.orderNumber}</td>
                    <td style={{ padding: '1rem' }}>{ord.user?.name || ord.shippingAddress?.fullName || 'Customer'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>${ord.totalPrice?.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-success">{ord.paymentStatus || 'Paid'}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        className="input"
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Details <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No orders found for selected filter status.</p>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
