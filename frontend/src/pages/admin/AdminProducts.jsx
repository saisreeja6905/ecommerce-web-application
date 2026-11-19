import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      await productService.deleteProduct(id);
      setMessage({ type: 'success', text: `Product "${name}" deleted successfully.` });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Could not delete product.',
      });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Manage Catalog Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {products.length} products registered in database inventory
          </p>
        </div>

        <Link to="/admin/products/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <PlusCircle size={18} /> Add New Product
        </Link>
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '380px', position: 'relative' }}>
        <input
          type="text"
          className="input"
          placeholder="Filter by product title or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-subtle)' }} />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading products table..." />
      ) : filteredProducts.length > 0 ? (
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
                  <th style={{ padding: '1rem' }}>Product</th>
                  <th style={{ padding: '1rem' }}>Department</th>
                  <th style={{ padding: '1rem' }}>Price</th>
                  <th style={{ padding: '1rem' }}>Stock</th>
                  <th style={{ padding: '1rem' }}>Rating</th>
                  <th style={{ padding: '1rem' }}>Visibility</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const img = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80';
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={img} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.95rem' }}>{p.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-info">{p.category?.name || 'General'}</span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>${p.price?.toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        {p.stockCount > 0 ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>{p.stockCount} in stock</span>
                        ) : (
                          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Out of stock</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>★ {p.rating?.toFixed(1) || '0.0'} ({p.numReviews || 0})</td>
                      <td style={{ padding: '1rem' }}>
                        {p.isFeatured && <span className="badge badge-primary" style={{ marginRight: '4px' }}>Featured</span>}
                        {p.isTrending && <span className="badge badge-warning">Trending</span>}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.6rem' }}
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No products found matching filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
