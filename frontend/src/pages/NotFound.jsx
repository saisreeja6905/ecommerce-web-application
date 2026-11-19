import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '1rem 0 0.5rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The URL you requested does not exist or has been relocated within the ApexStore catalog.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <Home size={18} /> Return to Home
          </Link>
          <Link to="/products" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
