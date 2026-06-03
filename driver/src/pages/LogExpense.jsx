import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LogExpense() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ expenseType: '', amount: '', description: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
      });
      if (res.ok) navigate('/expenses');
      else { const d = await res.json(); setError(d.message || 'Failed'); }
    } catch (e) { setError('Error'); }
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <div className="bg-white border border-gray-300 p-4 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold mb-1">Log Expense</h2>
        <p className="text-sm text-gray-600 mb-6">Record your business-related trip cost for reimbursement.</p>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Expense Type</label>
              <select value={form.expenseType} onChange={e => setForm(p => ({ ...p, expenseType: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 bg-white">
                <option value="">Select type</option>
                <option value="fuel_purchase">Fuel Purchase</option>
                <option value="park_levy">Park Levy</option>
                <option value="bus_repair">Bus Repair</option>
                <option value="tyre_replacement">Tyre Replacement</option>
                <option value="toll_fee">Toll Fee</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Amount (#)</label>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Description of the Issue</label>
            <textarea rows="4" placeholder="Enter expense details, location or reason..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 resize-y" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Upload Receipt</label>
            <div className="border-2 border-dashed border-gray-300 p-6 md:p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <svg className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">SUBMIT EXPENSE</button>
          <button type="button" onClick={() => navigate('/expenses')} className="w-full border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer">CANCEL</button>
        </form>
      </div>
    </div>
  );
}
