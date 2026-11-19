import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  AlertCircle,
  Star,
  Share2,
} from 'lucide-react';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Rating from '../components/common/Rating';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProduct(slug);
        const p = data.product || data;
        setProduct(p);

        if (p.images && p.images.length > 0) {
          setSelectedImage(p.images[0]);
        } else {
          setSelectedImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
        }

        // Fetch related products
        if (p._id) {
          productService.getRelatedProducts(p._id)
            .then((res) => setRelatedProducts(res.products || []))
            .catch(() => {});

          reviewService.getProductReviews(p._id)
            .then((res) => setReviews(res.reviews || []))
            .catch(() => {});
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) return <LoadingSpinner text="Loading product details..." />;
  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <Alert type="danger" message={error || 'Product not found'} />
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleAddToCart = async () => {
    if (product.stockCount <= 0 || addingToCart) return;
    setAddingToCart(true);
    await addToCart(product, quantity);
    setAddingToCart(false);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      setReviewMessage(null);
      const res = await reviewService.createReview(product._id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      setReviews([res.review, ...reviews]);
      setReviewTitle('');
      setReviewComment('');
      setReviewMessage({ type: 'success', text: 'Thank you! Your verified review has been published.' });
    } catch (err) {
      setReviewMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Could not submit review. You may have already reviewed this product.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [selectedImage];

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Breadcrumb navigation */}
      <nav style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link> &gt;{' '}
        <Link to="/products" style={{ color: 'var(--text-muted)' }}>Products</Link> &gt;{' '}
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Product Main Display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem',
      }}>
        {/* Images Gallery */}
        <div>
          <div style={{
            width: '100%',
            height: '420px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={selectedImage}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
            />
          </div>

          {imagesList.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {imagesList.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '10px',
                    border: selectedImage === img ? '2px solid var(--primary)' : '1px solid var(--border)',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    padding: '2px',
                    flexShrink: 0,
                  }}
                >
                  <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            {product.category && (
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                {product.category.name || product.category}
              </span>
            )}
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Rating value={product.rating || 4.5} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>({product.numReviews || reviews.length} reviews)</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SKU: {product.sku || 'APX-7742'}</span>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${product.price?.toFixed(2)}
            </span>
            {product.comparePrice > product.price && (
              <>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-subtle)', textDecoration: 'line-through' }}>
                  ${product.comparePrice?.toFixed(2)}
                </span>
                <span className="badge badge-success">Save {discountPercent}%</span>
              </>
            )}
          </div>

          {/* Description */}
          <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '1rem' }}>
            {product.description}
          </p>

          {/* Stock availability */}
          <div>
            {product.stockCount > 0 ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={14} /> In Stock ({product.stockCount} units available)
              </span>
            ) : (
              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={14} /> Out of Stock
              </span>
            )}
          </div>

          {/* Quantity & CTA */}
          {product.stockCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '0.6rem 1rem', background: '#ffffff', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span style={{ padding: '0.6rem 1.25rem', fontWeight: 700, minWidth: '48px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  style={{ padding: '0.6rem 1rem', background: '#ffffff', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem 1.5rem', fontSize: '1rem' }}
              >
                {cartSuccess ? (
                  <>
                    <Check size={20} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} /> Add to Cart (${(product.price * quantity).toFixed(2)})
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="btn btn-outline"
                style={{
                  padding: '0.85rem',
                  borderColor: isFavorited ? 'var(--danger)' : 'var(--border)',
                  color: isFavorited ? 'var(--danger)' : 'var(--text-main)',
                }}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          {/* Guarantees Box */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginTop: '1rem',
            fontSize: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} color="var(--primary)" /> Free shipping over $100
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--success)" /> Authenticity Certified
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={16} color="var(--warning)" /> 30-Day Guaranteed Returns
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews Tabs */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem' }}>Technical Specifications</h2>
        {product.specifications && product.specifications.length > 0 ? (
          <div style={{
            maxWidth: '650px',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '3rem',
          }}>
            {product.specifications.map((spec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)',
                  fontSize: '0.9rem',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{spec.key}</span>
                <span style={{ color: 'var(--text-main)' }}>{spec.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
            Standard industrial specifications compliant with Apex global retail standards.
          </p>
        )}

        {/* Customer Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Customer Feedback & Reviews</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Verified customer ratings and testimonials
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{product.rating?.toFixed(1) || '4.8'}</span>
              <div>
                <Rating value={product.rating || 4.8} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Based on {reviews.length} reviews</span>
              </div>
            </div>
          </div>

          {/* Write a review form */}
          {isAuthenticated ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.75rem',
              marginBottom: '2.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Write a Customer Review</h3>
              {reviewMessage && (
                <Alert type={reviewMessage.type} message={reviewMessage.text} />
              )}
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    Select Rating:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= reviewRating ? '#f59e0b' : '#cbd5e1',
                        }}
                      >
                        <Star size={24} fill={star <= reviewRating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    Review Headline / Summary:
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Exceptional build quality and sound..."
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    Detailed Experience:
                  </label>
                  <textarea
                    className="input"
                    rows="4"
                    placeholder="Share your thoughts on performance, packaging, and usability..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {submittingReview ? 'Submitting Review...' : 'Post Verified Review'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}>
              <p style={{ color: 'var(--text-muted)' }}>
                Have you purchased this item? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link> to share your verified review.
              </p>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700 }}>{rev.user?.name || 'Verified Buyer'}</span>
                      <Rating value={rev.rating} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rev.title && <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{rev.title}</h4>}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
              No reviews posted yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem' }}>Customers Also Viewed</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
