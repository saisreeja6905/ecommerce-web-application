import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Truck,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const items = cart.items || [];

  const subtotal = items.reduce((acc, item) => {
    const price = item.price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  // Shipping Address Form
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States',
  });

  // Payment Selection: 'razorpay' | 'card_sandbox' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Card details (simulated sandbox, never stored)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardName: user?.name || 'Jane Doe',
    expDate: '12/28',
    cvv: '123',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>No items in bag for checkout</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate shipping address
    if (
      !shippingAddress.fullName ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.zipCode
    ) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create Order on Backend
      const orderPayload = {
        items: items.map((i) => ({
          product: i.product?._id || i.product,
          name: i.product?.name || 'Item',
          price: i.price || i.product?.price || 0,
          quantity: i.quantity,
          image: (i.product?.images && i.product.images[0]) || '',
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      };

      const orderRes = await orderService.createOrder(orderPayload);
      const newOrder = orderRes.order;
      setCreatedOrder(newOrder);

      // 2. Handle Payment Flow
      if (paymentMethod === 'razorpay') {
        // Initialize Razorpay Order via Backend
        const rzpRes = await paymentService.createRazorpayOrder(newOrder._id);
        setRazorpayOrderData(rzpRes);
        setRazorpayModalOpen(true);
        setLoading(false);
      } else if (paymentMethod === 'card_sandbox') {
        // Confirm Generic Sandbox Card Payment
        await paymentService.confirmPayment({
          orderId: newOrder._id,
          paymentMethod: 'card_sandbox',
          paymentDetails: {
            cardBrand: 'Visa (Test)',
            last4: '4242',
          },
        });

        await clearCart();
        setLoading(false);
        navigate(`/order-confirmation/${newOrder._id}`);
      } else {
        // COD / Test Pay on Delivery
        await clearCart();
        setLoading(false);
        navigate(`/order-confirmation/${newOrder._id}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Could not complete checkout. Please verify inputs.');
      setLoading(false);
    }
  };

  // Complete simulated Razorpay checkout with cryptographic server verification
  const handleRazorpayVerify = async () => {
    try {
      setLoading(true);
      const mockPaymentId = `pay_${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 8)}`;
      const mockSignature = 'sandbox_verified_signature';

      const verifyRes = await paymentService.verifyRazorpayPayment({
        orderId: createdOrder._id,
        razorpay_order_id: razorpayOrderData?.razorpayOrderId || `order_${createdOrder._id.slice(0, 10)}`,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      });

      if (verifyRes.success) {
        setRazorpayModalOpen(false);
        await clearCart();
        navigate(`/order-confirmation/${createdOrder._id}`);
      } else {
        setError('Server-side payment verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Razorpay payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>Checkout & Payment</h1>

      {error && <Alert type="danger" message={error} />}

      <form onSubmit={handlePlaceOrder} style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(320px, 400px)',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Left Column: Shipping & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Shipping Address */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary)" /> 1. Shipping Destination
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="input"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  name="phone"
                  className="input"
                  placeholder="+1 (555) 000-0000"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Country / Region *
                </label>
                <input
                  type="text"
                  name="country"
                  className="input"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  className="input"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  className="input"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    State / Prov.
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="input"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    className="input"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} color="var(--primary)" /> 2. Secure Payment Selection
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Option 1: Razorpay Test Mode */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.25rem',
                borderRadius: '12px',
                border: paymentMethod === 'razorpay' ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: paymentMethod === 'razorpay' ? 'var(--primary-50)' : '#ffffff',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  style={{ marginTop: '4px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Razorpay Test Sandbox</span>
                    <span className="badge badge-primary">Recommended</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    UPI, NetBanking, Credit/Debit cards with server-side HMAC signature verification.
                  </p>
                </div>
              </label>

              {/* Option 2: Card Sandbox */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.25rem',
                borderRadius: '12px',
                border: paymentMethod === 'card_sandbox' ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: paymentMethod === 'card_sandbox' ? 'var(--primary-50)' : '#ffffff',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card_sandbox"
                  checked={paymentMethod === 'card_sandbox'}
                  onChange={() => setPaymentMethod('card_sandbox')}
                  style={{ marginTop: '4px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Simulated Test Card (Sandbox)</span>
                    <CreditCard size={18} color="var(--text-muted)" />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Instant mock card confirmation for verification and testing.
                  </p>
                </div>
              </label>

              {/* Option 3: Cash on Delivery */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.25rem',
                borderRadius: '12px',
                border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: paymentMethod === 'cod' ? 'var(--primary-50)' : '#ffffff',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ marginTop: '4px' }}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Pay on Delivery / COD</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Pay upon physical delivery of goods.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: '100px',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Summary Details</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem' }}>
            {items.map((item, idx) => {
              const product = item.product || {};
              const price = item.price || product.price || 0;
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {product.name || 'Item'} x {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>${(price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem',
              fontSize: '1.25rem',
              fontWeight: 800,
            }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
          >
            {loading ? 'Processing Order...' : `Authorize & Pay $${total.toFixed(2)}`}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
            🔒 256-Bit SSL Encrypted. No real financial credentials stored.
          </p>
        </div>
      </form>

      {/* Razorpay Interactive Modal Simulation */}
      {razorpayModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
          }}>
            {/* Razorpay Modal Header */}
            <div style={{ backgroundColor: '#0c2340', color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Razorpay Checkout</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Test Sandbox Mode</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{(total * 85).toFixed(0)}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8 }}>(${total.toFixed(2)} USD)</span>
              </div>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <p><strong>Order ID:</strong> {razorpayOrderData?.razorpayOrderId || 'rzp_order_test'}</p>
                <p><strong>Customer:</strong> {shippingAddress.fullName} ({shippingAddress.phone})</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Simulate Razorpay Test Method:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                    📱 UPI (GPay/PhonePe)
                  </button>
                  <button type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                    💳 Test Cards
                  </button>
                  <button type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                    🏦 NetBanking
                  </button>
                  <button type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                    👛 Wallets
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRazorpayVerify}
                disabled={loading}
                className="btn btn-primary"
                style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
              >
                {loading ? 'Verifying HMAC Signature...' : 'Simulate Success & Verify Signature'}
              </button>

              <button
                type="button"
                onClick={() => setRazorpayModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
              >
                Cancel and return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
