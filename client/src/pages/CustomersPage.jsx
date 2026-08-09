import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  Clock,
  X,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

const CustomersPage = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: 10000,
  });

  // Follow Up Form State
  const [newFollowUp, setNewFollowUp] = useState({
    notes: '',
    nextFollowUpDate: '',
    status: 'Pending',
  });

  const canEdit = hasRole('Admin', 'Sales');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${encodeURIComponent(search)}`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', newCustomer);
      setShowAddModal(false);
      setNewCustomer({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        creditLimit: 10000,
      });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await api.post(`/customers/${selectedCustomer._id}/follow-ups`, newFollowUp);
      setShowFollowUpModal(false);
      setNewFollowUp({ notes: '', nextFollowUpDate: '', status: 'Pending' });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log follow-up');
    }
  };

  const handleToggleFollowUpStatus = async (customerId, followUpId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await api.put(`/customers/${customerId}/follow-ups/${followUpId}`, {
        status: nextStatus,
      });
      fetchCustomers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            Customer Accounts & CRM Logs
          </h1>
          <p className="text-xs text-zinc-500 font-mono">Manage accounts, credit limits, and sales interaction logs</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Customer Account
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company name, contact person, email or phone..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-500 font-mono placeholder:text-zinc-400 shadow-sm"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading customer directory...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No customers found matching search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Company & Contact</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-center">CRM Logs</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{c.companyName}</div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-zinc-400" />
                        {c.contactPerson}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-400" /> {c.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-400" /> {c.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${c.creditLimit?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        <MessageSquare className="w-3 h-3 text-zinc-500" />
                        {c.followUps?.length || 0} Logs
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setShowFollowUpModal(true);
                        }}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] rounded transition"
                      >
                        Manage CRM Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Add New Customer Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCustomer.companyName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  placeholder="Apex Global LLC"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Contact Person</label>
                <input
                  type="text"
                  required
                  value={newCustomer.contactPerson}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                  placeholder="Arthur Dent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Phone</label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Billing Address</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Credit Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={newCustomer.creditLimit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded"
                >
                  Save Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM Follow-Up Drawer Modal */}
      {showFollowUpModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedCustomer.companyName}</h3>
                <p className="text-xs text-zinc-500 font-mono">CRM Interaction & Sales Log History</p>
              </div>
              <button onClick={() => setShowFollowUpModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Log New Follow Up Form */}
            {canEdit && (
              <form onSubmit={handleAddFollowUp} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Record New Sales Log / Action</h4>
                <div>
                  <textarea
                    required
                    placeholder="Enter detailed discussion notes, client requirements, or action items..."
                    value={newFollowUp.notes}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase">Next Follow Up Date</label>
                    <input
                      type="date"
                      value={newFollowUp.nextFollowUpDate}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, nextFollowUpDate: e.target.value })}
                      className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase">Log Status</label>
                    <select
                      value={newFollowUp.status}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, status: e.target.value })}
                      className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="Pending">Pending Action</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded"
                >
                  Log CRM Entry
                </button>
              </form>
            )}

            {/* Existing Logs List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Past Interactions</h4>
              {selectedCustomer.followUps?.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3">No follow-up logs recorded for this account yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.followUps.map((fu) => (
                    <div
                      key={fu._id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {fu.salesRepId?.name || 'Sales Rep'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(fu.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300">{fu.notes}</p>
                        {fu.nextFollowUpDate && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1 pt-1">
                            <Clock className="w-3 h-3" /> Next Due: {new Date(fu.nextFollowUpDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          handleToggleFollowUpStatus(selectedCustomer._id, fu._id, fu.status)
                        }
                        className={`text-[10px] font-bold px-2 py-1 rounded border transition ${
                          fu.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {fu.status}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
