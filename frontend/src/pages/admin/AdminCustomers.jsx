import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getAllUsers()
      .then((res) => {
        setUsers(res.users || []);
      })
      .catch((err) => {
        console.error('Failed to load customers:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Registered Customers & Accounts</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {users.length} registered profiles in user database
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem', maxWidth: '360px' }}>
        <input
          type="text"
          className="input"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving customer accounts..." />
      ) : filteredUsers.length > 0 ? (
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
                  <th style={{ padding: '1rem' }}>User Name</th>
                  <th style={{ padding: '1rem' }}>Email Address</th>
                  <th style={{ padding: '1rem' }}>Contact Phone</th>
                  <th style={{ padding: '1rem' }}>System Role</th>
                  <th style={{ padding: '1rem' }}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>{u.phone || 'Not provided'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={u.role === 'admin' ? 'badge badge-primary' : 'badge badge-success'}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No customer profiles match your search.</p>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
