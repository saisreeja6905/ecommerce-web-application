import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
      marginTop: '4rem',
    }}>
      {/* Service Perks Banner */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        paddingBottom: '3rem',
        borderBottom: '1px solid #1e293b',
        marginBottom: '3rem',
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: 'var(--primary-400)' }}><Truck size={32} /></div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 600 }}>Free Global Delivery</div>
            <div style={{ fontSize: '0.85rem' }}>On all orders above $100</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: 'var(--primary-400)' }}><ShieldCheck size={32} /></div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 600 }}>Secure Checkout</div>
            <div style={{ fontSize: '0.85rem' }}>Encrypted 256-bit Stripe payments</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: 'var(--primary-400)' }}><RotateCcw size={32} /></div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 600 }}>30-Day Easy Returns</div>
            <div style={{ fontSize: '0.85rem' }}>Hassle-free replacement guarantee</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: 'var(--primary-400)' }}><Headphones size={32} /></div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 600 }}>24/7 Dedicated Care</div>
            <div style={{ fontSize: '0.85rem' }}>Expert live customer support</div>
          </div>
        </div>
      </div>

      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2.5rem',
        paddingBottom: '3rem',
        borderBottom: '1px solid #1e293b',
      }}>
        {/* Brand Column */}
        <div style={{ maxWidth: '320px' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.3rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '1rem',
          }}>
            <ShoppingBag size={22} color="var(--primary-400)" />
            <span>APEX<span style={{ color: 'var(--primary-400)' }}>STORE</span></span>
          </Link>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Curated high-performance electronics, acoustics, technical apparel, and everyday lifestyle essentials. Built for uncompromising quality.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>Categories</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <li><Link to="/products?category=electronics" style={{ hover: { color: '#ffffff' } }}>Electronics & Gadgets</Link></li>
            <li><Link to="/products?category=audio">Audio & Acoustics</Link></li>
            <li><Link to="/products?category=fashion">Fashion & Apparel</Link></li>
            <li><Link to="/products?category=home-living">Home & Living</Link></li>
            <li><Link to="/products?category=fitness">Sports & Fitness</Link></li>
            <li><Link to="/products?category=accessories">Watches & Accessories</Link></li>
          </ul>
        </div>

        {/* Account & Help */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>Customer Portal</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <li><Link to="/profile">My Account</Link></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/wishlist">Saved Wishlist</Link></li>
            <li><Link to="/products">All Products</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>Stay Connected</h4>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Receive exclusive seasonal drops, member discounts, and tech insights directly to your inbox.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#ffffff',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                flex: 1,
                outline: 'none',
              }}
            />
            <button className="btn btn-primary btn-sm">Subscribe</button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container" style={{
        paddingTop: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.8rem',
      }}>
        <div>&copy; {new Date().getFullYear()} ApexStore Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
