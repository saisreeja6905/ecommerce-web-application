import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, FolderTree } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, { name, description, image });
        setMessage({ type: 'success', text: `Category "${name}" updated successfully.` });
      } else {
        await categoryService.createCategory({ name, description, image });
        setMessage({ type: 'success', text: `Category "${name}" created successfully.` });
      }

      handleCancel();
      await fetchCategories();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error saving category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to remove category "${catName}"?`)) return;

    try {
      await categoryService.deleteCategory(id);
      setMessage({ type: 'success', text: `Category "${catName}" removed.` });
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete category.' });
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Product Categories & Departments</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Organize store inventory into browsable departmental taxonomies.
        </p>
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 360px) 1fr',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Category Form */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Category Name *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Smart Watches & Wearables"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Description
              </label>
              <textarea
                className="input"
                rows="3"
                placeholder="Department overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Image / Icon URL
              </label>
              <input
                type="text"
                className="input"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create Category'}
              </button>
              {editingCategory && (
                <button type="button" onClick={handleCancel} className="btn btn-outline" style={{ padding: '0.75rem' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {loading ? (
            <LoadingSpinner text="Loading categories list..." />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Category Name</th>
                  <th style={{ padding: '1rem' }}>Slug</th>
                  <th style={{ padding: '1rem' }}>Products Count</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{c.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.slug}</td>
                    <td style={{ padding: '1rem' }}>{c.productCount || 0}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(c)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem' }} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(c._id, c.name)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
