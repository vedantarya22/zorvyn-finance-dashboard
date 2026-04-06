import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Records.css';

const EMPTY_FORM = { amount: '', type: 'income', category: '', date: '', notes: '' };

const Records = () => {
  const { hasRole }               = useAuth();
  const isAdmin                   = hasRole('admin');
  const [records, setRecords]     = useState([]);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const fetchRecords = async (p = 1, type = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (type) params.append('type', type);
      const res = await api.get(`/records?${params}`);
      setRecords(res.data.records);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(page, filter); }, [page, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm({
      amount:   record.amount,
      type:     record.type,
      category: record.category,
      date:     record.date.slice(0, 10),
      notes:    record.notes || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.category || !form.date) {
      return setError('Amount, category and date are required.');
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.patch(`/records/${editing._id}`, form);
      } else {
        await api.post('/records', form);
      }
      setShowModal(false);
      fetchRecords(page, filter);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await api.delete(`/records/${id}`);
    fetchRecords(page, filter);
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <>
      <Navbar />
      <div className="records__page">

        {/* Header */}
        <div className="records__header">
          <h1 className="records__title">Financial records</h1>
          {isAdmin && (
            <button className="records__add-btn" onClick={openCreate}>
              + Add record
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="records__filters">
          {[
            { label: 'All',     value: ''        },
            { label: 'Income',  value: 'income'  },
            { label: 'Expense', value: 'expense' },
          ].map(({ label, value }) => (
            <button
              key={label}
              className={`records__chip ${filter === value ? 'records__chip--active' : ''}`}
              onClick={() => { setFilter(value); setPage(1); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="records__table-wrap">
          <table className="records__table">
            <thead>
              <tr>
                <th className="records__th">Category</th>
                <th className="records__th">Notes</th>
                <th className="records__th">Type</th>
                <th className="records__th">Date</th>
                <th className="records__th">Amount</th>
                {isAdmin && <th className="records__th">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="records__empty">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="records__empty">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="records__tr">
                    <td className="records__td records__td--bold">{r.category}</td>
                    <td className="records__td records__td--muted">{r.notes || '—'}</td>
                    <td className="records__td">
                      <span className={`type-pill type-pill--${r.type}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="records__td records__td--date">
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>
                    <td className={`records__td records__td--${r.type === 'income' ? 'green' : 'red'}`}>
                      {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </td>
                    {isAdmin && (
                      <td className="records__td">
                        <div className="records__actions">
                          <button
                            className="records__edit-btn"
                            onClick={() => openEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="records__del-btn"
                            onClick={() => handleDelete(r._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="records__pagination">
          <button
            className="records__pg-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`records__pg-btn ${page === p ? 'records__pg-btn--active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="records__pg-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="records__overlay">
          <div className="records__modal">

            <h2 className="records__modal-title">
              {editing ? 'Edit record' : 'New record'}
            </h2>

            {error && (
              <div className="records__modal-error">{error}</div>
            )}

            <div className="records__modal-form">
              <div className="records__form-row">
                <label className="records__form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="records__form-input"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="records__form-row">
                <label className="records__form-label">Type</label>
                <select
                  className="records__form-input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="records__form-row">
                <label className="records__form-label">Category</label>
                <input
                  className="records__form-input"
                  placeholder="e.g. Salary"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="records__form-row">
                <label className="records__form-label">Date</label>
                <input
                  type="date"
                  className="records__form-input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="records__form-row">
                <label className="records__form-label">Notes (optional)</label>
                <input
                  className="records__form-input"
                  placeholder="Any description..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="records__modal-actions">
              <button
                className="records__cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="records__save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save record'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Records;