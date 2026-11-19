import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  TrendingUp,
  Award,
  Search,
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeSearch, setHomeSearch] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, trendingRes, catRes] = await Promise.all([
          productService.getFeaturedProducts().catch(() => ({ products: [] })),
          productService.getTrendingProducts().catch(() => ({ products: [] })),
          categoryService.getCategories().catch(() => ({ categories: [] })),
        ]);

        setFeaturedProducts(featuredRes.products || []);
        setTrendingProducts(trendingRes.products || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(homeSearch.trim())}`);
    }
  };

  const fallbackCategories = [
    { name: 'Electronics', slug: 'electronics', icon: '💻', count: '120+ Products' },
    { name: 'Clothing & Apparel', slug: 'clothing', icon: '👔', count: '85+ Products' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🍳', count: '64+ Products' },
    { name: 'Books & Media', slug: 'books', icon: '📚', count: '45+ Products' },
    { name: 'Sports & Fitness', slug: 'sports-outdoors', icon: '⚽', count: '50+ Products' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', icon: '✨', count: '38+ Products' },
  ];

  const displayedCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        color: '#ffffff',
        padding: '5rem 1rem',
        borderRadius: '0 0 24px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '3rem',
          position: 'relative',
          zIndex: 2,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}>
              <Sparkles size={16} /> 2026 Next-Gen Flagship Catalog
            </div>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
            }}>
              Curated Excellence for Modern Lifestyles.
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: 0.9,
              marginBottom: '2rem',
              maxWidth: '540px',
              lineHeight: 1.6,
            }}>
              Explore authentic luxury electronics, bespoke fashion, smart appliances, and sustainable living gear with verifiable quality and instant checkout.
            </p>

            {/* Quick Hero Search */}
            <form onSubmit={handleSearch} style={{
              display: 'flex',
              maxWidth: '480px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '0.35rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              marginBottom: '1.5rem',
            }}>
              <input
                type="text"
                placeholder="Search premium products, audio, watches..."
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0.65rem 1rem',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                <Search size={18} /> Search
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/products" className="btn btn-primary" style={{
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 700,
                boxShadow: 'var(--shadow-md)',
              }}>
                Shop Entire Catalog <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=trending" className="btn" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}>
                <TrendingUp size={18} /> Trending Now
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                alt="Featured Headset"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.5rem',
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)',
              }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Staff Choice</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Audiophile Wireless ANC</h3>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>High-fidelity spatial sound reproduction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Value Pillars */}
      <section className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          padding: '1.75rem',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Free Global Delivery</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>On eligible orders over $100</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Verifiable Security</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>HMAC SHA256 test sandbox payments</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>30-Day Hassle-Free</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Instant returns & guaranteed refunds</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>24/7 Dedicated Support</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expert client concierge anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Departments
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Explore by Category</h2>
          </div>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--primary)' }}>
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
        }}>
          {displayedCategories.map((cat, idx) => (
            <Link
              key={cat._id || cat.slug || idx}
              to={`/products?category=${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{
                fontSize: '2.5rem',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {cat.icon || '🛍️'}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {cat.productCount ? `${cat.productCount} Items` : cat.count || 'Explore now'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              <Award size={18} /> HANDPICKED SELECTIONS
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Featured Products</h2>
          </div>
          <Link to="/products?featured=true" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--primary)' }}>
            View All Featured <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading featured selections..." />
        ) : featuredProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
          }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Connecting to catalog. View full catalog to explore inventory.
            </p>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
          </div>
        )}
      </section>

      {/* Mid-Page Promotional Banner */}
      <section className="container">
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '3.5rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          alignItems: 'center',
          gap: '2rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div>
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '1rem',
            }}>
              SPECIAL REWARD CODE: APEX2026
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Upgrade Your Everyday Lifestyle
            </h2>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Enjoy automated complimentary shipping on premium noise-cancelling headphones, high-precision smartwatch trackers, and ergonomic workstations.
            </p>
            <Link to="/products" className="btn" style={{
              backgroundColor: '#ffffff',
              color: '#1e40af',
              fontWeight: 700,
              padding: '0.75rem 1.75rem',
            }}>
              Claim Offer Now <ArrowRight size={18} />
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80"
              alt="Promotion"
              style={{
                width: '100%',
                maxWidth: '360px',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              <TrendingUp size={18} /> POPULAR WITH BUYERS
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Trending Products</h2>
          </div>
          <Link to="/products?sort=trending" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--primary)' }}>
            See All Trending <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading trending items..." />
        ) : trendingProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {trendingProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
          }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Check out our complete catalog for the latest trending inventory.
            </p>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
