import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const items = cart.items || [];

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const itemPrice = item.price || item.product?.price || 0;
    return acc + itemPrice * item.quantity;
  }, 0);

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '3rem 2rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <ShoppingBag size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your shopping cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
            Looks like you haven't added any products to your bag yet. Discover our curated catalog today.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Explore Catalog <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>Shopping Bag</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(320px, 380px)',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Cart Items List */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              {items.length} {items.length === 1 ? 'Product' : 'Products'} in Cart
            </span>
            <button
              onClick={clearCart}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Empty Bag
            </button>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {items.map((item, idx) => {
              const product = item.product || {};
              const price = item.price || product.price || 0;
              const img = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';

              return (
                <div
                  key={item._id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto auto',
                    gap: '1.25rem',
                    alignItems: 'center',
                    padding: '1.25rem',
                    borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <img
                    src={img}
                    alt={product.name || 'Product'}
                    style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }}
                  />

                  <div>
                    <Link
                      to={`/products/${product.slug || product._id || ''}`}
                      style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', textDecoration: 'none' }}
                    >
                      {product.name || 'Premium Item'}
                    </Link>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Unit: ${price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      style={{ padding: '0.4rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0.4rem 0.6rem', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{ padding: '0.4rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '0.3rem',
                        marginTop: '0.25rem',
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Checkout Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Bag Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Tax (10%)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Shipping & Delivery</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {shipping === 0 ? <span className="badge badge-success">FREE</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            {shipping > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                Add ${(100 - subtotal).toFixed(2)} more for complimentary delivery!
              </p>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: 800,
            }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--success)" /> Verified test sandbox payments
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} color="var(--primary)" /> Dispatched with tracking notifications
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
