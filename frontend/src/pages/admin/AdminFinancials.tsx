import { useState, useEffect } from 'react';
import { api, FinancialRecord } from '../../api/api';
import './AdminFinancials.css';

const CATEGORIES = ['Salary', 'Travel', 'Outreach', 'Office Supplies', 'Donation', 'Grant', 'Equipment', 'Other'];

export default function AdminFinancials({ isExecutive: _isExecutive }: { isExecutive?: boolean }) {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: CATEGORIES[0],
    date: '',
    description: ''
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const data = await api.getFinancials();
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial ledger');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      type: 'EXPENSE',
      category: CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (r: FinancialRecord) => {
    setEditingId(r.id);
    setFormData({
      title: r.title,
      amount: r.amount.toString(),
      type: r.type,
      category: r.category,
      date: new Date(r.date).toISOString().split('T')[0],
      description: r.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) {
        await api.updateFinancialRecord(editingId, { ...formData, amount: parseFloat(formData.amount) });
      } else {
        await api.createFinancialRecord({ ...formData, amount: parseFloat(formData.amount) });
      }
      setShowModal(false);
      fetchFinancials();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this financial record?')) return;
    try {
      await api.deleteFinancialRecord(id);
      fetchFinancials();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const totalIncome = records.filter(r => r.type === 'INCOME').reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'EXPENSE').reduce((acc, r) => acc + r.amount, 0);
  const balance = totalIncome - totalExpense;

  if (loading && records.length === 0) return <div className="af-loading">Loading financial ledger...</div>;

  return (
    <div className="af">
      <div className="af__header">
        <div>
          <h1 className="af__title">Financial Ledger</h1>
          <p className="af__subtitle">Track income, expenses, and overall budget health for the organization.</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">add_card</span>
          Add Entry
        </button>
      </div>

      <div className="af__summary grid grid--3">
        <div className="af__summary-card card">
          <div className="af__summary-icon af__summary-icon--income">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div>
            <h3>Total Income</h3>
            <strong>${totalIncome.toLocaleString()}</strong>
          </div>
        </div>
        <div className="af__summary-card card">
          <div className="af__summary-icon af__summary-icon--expense">
            <span className="material-symbols-outlined">trending_down</span>
          </div>
          <div>
            <h3>Total Expenses</h3>
            <strong>${totalExpense.toLocaleString()}</strong>
          </div>
        </div>
        <div className="af__summary-card card">
          <div className="af__summary-icon af__summary-icon--balance">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <h3>Net Balance</h3>
            <strong className={balance >= 0 ? 'text-success' : 'text-danger'}>
              {balance < 0 ? '-' : ''}${Math.abs(balance).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {error && <div className="af__error card">{error}</div>}

      <div className="af__table-card card">
        <div className="af__table-wrapper">
          <table className="af__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title / Description</th>
                <th>Category</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No financial records found.
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <div className="af__entry-info">
                        <strong>{record.title}</strong>
                        <span>{record.description || 'No additional details'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="af__category-badge">{record.category}</span>
                    </td>
                    <td>
                      <span className={`af__type-badge af__type-badge--${record.type.toLowerCase()}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className={`text-right af__amount af__amount--${record.type.toLowerCase()}`}>
                      {record.type === 'EXPENSE' ? '-' : '+'}${record.amount.toLocaleString()}
                    </td>
                    <td>
                      <div className="af__actions">
                        <button onClick={() => openEditModal(record)} title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="af__action--danger" onClick={() => handleDelete(record.id)} title="Delete">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="af__modal-overlay">
          <div className="af__modal card">
            <div className="af__modal-header">
              <h2>{editingId ? 'Edit Financial Entry' : 'New Financial Entry'}</h2>
              <button onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="af__form">
              <div className="af__form-group">
                <label>Entry Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="E.g., Quarterly Office Rent"
                  required 
                />
              </div>
              <div className="af__form-row">
                <div className="af__form-group">
                  <label>Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required 
                  />
                </div>
                <div className="af__form-group">
                  <label>Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>
              <div className="af__form-row">
                <div className="af__form-group">
                  <label>Category</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="af__form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="af__form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional notes or receipt references..."
                  rows={3}
                />
              </div>
              <div className="af__modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : (editingId ? 'Update Entry' : 'Add to Ledger')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
