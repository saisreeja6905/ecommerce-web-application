import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Package } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: 'Apex Brand',
    price: '',
    comparePrice: '',
    category: '',
    stockCount: 10,
    sku: '',
    images: '',
    isFeatured: false,
    isTrending: false,
    specifications: [
      { key: 'Material', value: 'Aerospace Alloy' },
      { key: 'Warranty', value: '2 Years Manufacturer' },
    ],
  });

  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        const cats = res.categories || [];
        setCategories(cats);
        if (!isEditing && cats.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: cats[0]._id }));
        }
      })
      .catch((err) => console.error('Categories load error:', err));

    if (isEditing) {
      productService.getProduct(id)
        .then((res) => {
          const p = res.product || res;
          setFormData({
            name: p.name || '',
            description: p.description || '',
            brand: p.brand || '',
            price: p.price || '',
            comparePrice: p.comparePrice || '',
            category: p.category?._id || p.category || '',
            stockCount: p.stockCount !== undefined ? p.stockCount : 10,
            sku: p.sku || '',
            images: (p.images || []).join('\n'),
            isFeatured: Boolean(p.isFeatured),
            isTrending: Boolean(p.isTrending),
            specifications: p.specifications && p.specifications.length > 0
              ? p.specifications
              : [{ key: 'Warranty', value: '1 Year' }],
          });
        })
        .catch((err) => {
          setMessage({ type: 'danger', text: 'Could not load existing product details.' });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData({ ...formData, specifications: updated });
  };

  const addSpecRow = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '' }],
    });
  };

  const removeSpecRow = (index) => {
    const updated = formData.specifications.filter((_, i) => i !== index);
    setFormData({ ...formData, specifications: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const imageUrls = formData.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
      stockCount: parseInt(formData.stockCount, 10),
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      specifications: formData.specifications.filter((s) => s.key && s.value),
    };

    try {
      if (isEditing) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save product. Please check form fields.',
      });
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product form..." />;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {isEditing ? 'Edit Catalog Product' : 'Create New Product'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Define title, pricing, departmental categorization, and inventory count.
        </p>

        {message && <Alert type={message.type} message={message.text} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title & Brand */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Product Title *
              </label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="e.g. Apex Ultra Wireless Headphones"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Brand
              </label>
              <input
                type="text"
                name="brand"
                className="input"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Product Description *
            </label>
            <textarea
              name="description"
              className="input"
              rows="4"
              placeholder="Comprehensive product copy, materials, and selling features..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Pricing & Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Retail Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                className="input"
                placeholder="99.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Compare At Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="comparePrice"
                className="input"
                placeholder="129.99"
                value={formData.comparePrice}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Inventory Units *
              </label>
              <input
                type="number"
                name="stockCount"
                className="input"
                value={formData.stockCount}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                SKU Identifier
              </label>
              <input
                type="text"
                name="sku"
                className="input"
                placeholder="APX-8821"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Category Department *
            </label>
            <select
              name="category"
              className="input"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image URLs */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Image URLs (One per line)
            </label>
            <textarea
              name="images"
              className="input"
              rows="3"
              placeholder="https://images.unsplash.com/..."
              value={formData.images}
              onChange={handleChange}
            />
          </div>

          {/* Checkboxes: Featured / Trending */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              Show on Homepage Featured Section
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                name="isTrending"
                checked={formData.isTrending}
                onChange={handleChange}
              />
              Flag as Trending Product
            </label>
          </div>

          {/* Specifications */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Specifications & Attributes</span>
              <button type="button" onClick={addSpecRow} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                <Plus size={14} /> Add Specification
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {formData.specifications.map((spec, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Key (e.g. Battery Life)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Value (e.g. 40 Hours)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 700, marginTop: '1rem' }}
          >
            {saving ? 'Saving Product...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
