import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const typeLabels = { fuel_purchase: 'Fuel Purchase', park_levy: 'Park Levy', bus_repair: 'Bus Repair', tyre_replacement: 'Tyre Replacement', toll_fee: 'Toll Fee', other: 'Other' };
const statusColors = { pending: 'text-gray-600', approved: 'text-green-600', rejected: 'text-red-600' };

export default function Expenses() {
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState({ from: '', to: '', type: '', status: '' });

  useEffect(() => {
    fetch(`${API_URL}/expenses`, { headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} })
      .then(r => r.ok ? r.json() : { expenses: [] }).then(d => setExpenses(d.expenses || [])).catch(() => {});
  }, []);

  const filtered = expenses.filter(e => {
    if (filter.type && e.expenseType !== filter.type) return false;
    if (filter.status && e.status !== filter.status) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Expense History</h1>
          <p className="text-sm text-gray-600">Track and manage your transport expenses submitted during trips.</p>
        </div>
        <Link to="/expenses/new" className="border border-gray-400 text-gray-700 px-4 py-2 text-xs bg-white hover:bg-gray-50 transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Submit New Expense
        </Link>
      </div>

      <div className="bg-white border border-gray-300 p-4 mb-4 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date Range</label>
            <div className="flex gap-2">
              <input type="date" className="w-full border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-600" value={filter.from} onChange={e => setFilter(p => ({ ...p, from: e.target.value }))} />
              <input type="date" className="w-full border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-600" value={filter.to} onChange={e => setFilter(p => ({ ...p, to: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Expense Type</label>
            <select className="w-full border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-600 bg-white" value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}>
              <option value="">All Types</option>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
            <select className="w-full border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-600 bg-white" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
              <option value="">Any Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end"><button className="w-full bg-blue-600 text-white px-4 py-2 text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer">Apply Filters</button></div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Date</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Expense Type</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Description</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Amount</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(exp => (
              <tr key={exp._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">{exp.date ? new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</td>
                <td className="py-3 px-4 text-sm">{typeLabels[exp.expenseType] || exp.expenseType}</td>
                <td className="py-3 px-4 text-sm text-gray-600 italic">{exp.description}</td>
                <td className="py-3 px-4 text-sm font-medium">#{exp.amount?.toLocaleString()}</td>
                <td className={`py-3 px-4 text-sm ${statusColors[exp.status] || ''}`}>{exp.status}</td>
              </tr>
            )) : (
              <>
                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-sm">March 24, 2026</td><td className="py-3 px-4 text-sm">Fuel Purchase</td><td className="py-3 px-4 text-sm text-gray-600 italic">Fuel refill at NNPC Ojota</td><td className="py-3 px-4 text-sm font-medium">#45,000</td><td className="py-3 px-4 text-sm text-gray-600">Pending</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-sm">April 20, 2026</td><td className="py-3 px-4 text-sm">Park Levy</td><td className="py-3 px-4 text-sm text-gray-600 italic">Oshodi terminal loading fee</td><td className="py-3 px-4 text-sm font-medium">#3,500</td><td className="py-3 px-4 text-sm text-green-600">Approved</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-sm">May 10, 2026</td><td className="py-3 px-4 text-sm">Bus Repair</td><td className="py-3 px-4 text-sm text-gray-600 italic">Brake adjustment at Yaba workshop</td><td className="py-3 px-4 text-sm font-medium">#18,000</td><td className="py-3 px-4 text-sm text-red-600">Rejected</td></tr>
                <tr><td className="py-3 px-4 text-sm">May 20, 2026</td><td className="py-3 px-4 text-sm">Tyre Replacement</td><td className="py-3 px-4 text-sm text-gray-600 italic">Front tyre replacement</td><td className="py-3 px-4 text-sm font-medium">#65,000</td><td className="py-3 px-4 text-sm text-green-600">Approved</td></tr>
              </>
            )}
          </tbody>
        </table>
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 text-sm text-gray-500 gap-2">
          <span className="text-xs">Showing 1-4 of {filtered.length || 28} submitted expenses</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs">&lt;</button>
            <button className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center text-xs">1</button>
            <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs">2</button>
            <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs">3</button>
            <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
