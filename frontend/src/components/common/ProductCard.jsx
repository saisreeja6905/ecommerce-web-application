import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Check } from 'lucide-react';
import Rating from './Rating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = isInWishlist(product._id);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockCount <= 0 || adding) return;

    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Product Image & Badges */}
      <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '80%', backgroundColor: '#f8fafc' }}>
        <Link to={`/products/${product.slug || product._id}`}>
          <img
            src={displayImage}
            alt={product.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </Link>

        {/* Discount Badge */}
        {discountPercent && (
          <span
            className="badge badge-danger"
            style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Featured Badge */}
        {product.isFeatured && !discountPercent && (
          <span
            className="badge badge-primary"
            style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}
          >
            Featured
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)',
            color: isFavorited ? 'var(--danger)' : 'var(--text-muted)',
          }}
          title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isFavorited ? 'var(--danger)' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
            {product.brand}
          </span>
          {product.stockCount <= 0 ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Out of Stock</span>
          ) : product.stockCount <= 5 ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>Only {product.stockCount} left</span>
          ) : null}
        </div>

        <Link
          to={`/products/${product.slug || product._id}`}
          style={{
            fontSize: '0.98rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div style={{ marginBottom: '0.75rem' }}>
          <Rating value={product.rating || 0} numReviews={product.numReviews} size={14} />
        </div>

        {/* Price & Action */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ${Number(product.price).toFixed(2)}
            </div>
            {product.comparePrice > product.price && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textDecoration: 'line-through' }}>
                ${Number(product.comparePrice).toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockCount <= 0 || adding}
            className={`btn btn-sm ${justAdded ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: justAdded ? 'var(--success-bg)' : undefined,
              borderColor: justAdded ? 'var(--success)' : undefined,
              color: justAdded ? 'var(--success)' : undefined,
            }}
          >
            {justAdded ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
