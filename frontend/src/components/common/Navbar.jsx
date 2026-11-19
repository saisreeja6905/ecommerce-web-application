import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  LayoutDashboard,
  Package,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Top Banner Notice */}
      <div style={{
        backgroundColor: 'var(--primary-dark)',
        color: '#ffffff',
        fontSize: '0.8rem',
        padding: '0.4rem 1rem',
        textAlign: 'center',
        fontWeight: 500,
      }}>
        ✨ Complimentary Express Delivery on all orders over $100 | Discover the 2026 Collection
      </div>

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        gap: '1.5rem',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--primary)',
          letterSpacing: '-0.02em',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--primary)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <ShoppingBag size={20} />
          </div>
          <span>APEX<span style={{ color: 'var(--text-main)' }}>STORE</span></span>
        </Link>

        {/* Search Bar - Desktop */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: '520px',
            position: 'relative',
            display: 'none',
          }}
          className="search-desktop"
        >
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'var(--transition)',
            }}
          />
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
        </form>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}>
          <Link
            to="/products"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              transition: 'var(--transition)',
            }}
          >
            Explore Catalog
          </Link>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            style={{
              position: 'relative',
              padding: '0.5rem',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="My Wishlist"
          >
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              padding: '0.5rem',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Cart"
          >
            <ShoppingCart size={22} />
            {totalItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* User Account Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: '1px solid var(--border)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span>{user?.name?.split(' ')[0]}</span>
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '210px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 0',
                    zIndex: 60,
                  }}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.85rem',
                  }}>
                    <div style={{ fontWeight: 600 }}>{user?.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <User size={16} /> My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Package size={16} /> Orders History
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.9rem',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        backgroundColor: 'var(--primary-50)',
                      }}
                    >
                      <LayoutDashboard size={16} /> Admin Portal
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)', margin: '0.4rem 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      width: '100%',
                      padding: '0.6rem 1rem',
                      fontSize: '0.9rem',
                      color: 'var(--danger)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
            }}
            className="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>
      </div>

      {/* Mobile search bar & menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Explore Catalog</Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlistCount})</Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart ({totalItemsCount})</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 600 }}>Admin Portal</Link>}
                <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', color: 'var(--danger)', fontWeight: 600, padding: 0 }}>Sign Out</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .search-desktop {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
