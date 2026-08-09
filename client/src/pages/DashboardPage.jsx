import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Truck,
  FileText,
  RefreshCw,
} from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-zinc-600 font-mono text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-zinc-900" />
          Loading Real-Time ERP Metrics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Enterprise Operations Overview</h1>
          <p className="text-xs text-zinc-600 font-mono font-medium">Live synchronization across Inventory, CRM, Procurement & Billing</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md text-xs text-zinc-700 font-medium transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Total Revenue Collected</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-zinc-900">
              ${stats?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-zinc-600 mt-1 flex items-center gap-1">
              <span>Pending Receivables:</span>
              <span className="text-amber-700 font-mono font-bold">
                ${stats?.totalPendingPayments?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Low Stock Items</span>
            <div className={`p-2 rounded-lg border ${stats?.lowStockCount > 0 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-mono ${stats?.lowStockCount > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
              {stats?.lowStockCount} Products
            </div>
            <div className="text-[11px] text-zinc-600 mt-1">
              Total Master Products: <span className="text-zinc-900 font-mono font-bold">{stats?.totalProducts}</span>
            </div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Pending CRM Follow-Ups</span>
            <div className="p-2 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-zinc-900">
              {stats?.pendingFollowUpsCount} Actions
            </div>
            <div className="text-[11px] text-zinc-600 mt-1">
              Active Customer Master: <span className="text-zinc-900 font-mono font-bold">{stats?.totalCustomers}</span>
            </div>
          </div>
        </div>

        {/* Outbound Dispatches */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Dispatched Challans</span>
            <div className="p-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-zinc-900">
              {stats?.dispatchedChallansCount} Outbound
            </div>
            <div className="text-[11px] text-zinc-600 mt-1">
              Open Purchase Orders: <span className="text-zinc-900 font-mono font-bold">{stats?.pendingPOsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Low Stock Alert Table & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning Table */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-zinc-900">Low Stock Inventory Alerts</h2>
            </div>
            <span className="text-[11px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
              {stats?.lowStockItems?.length || 0} Reorder Flags
            </span>
          </div>

          {stats?.lowStockItems?.length === 0 ? (
            <p className="text-xs text-zinc-600 py-6 text-center">All inventory stock levels are currently optimal.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-600 font-mono uppercase text-[10px] bg-zinc-50">
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3 text-right">Current</th>
                    <th className="py-2 px-3 text-right">Min Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {stats?.lowStockItems?.map((item) => (
                    <tr key={item._id} className="hover:bg-zinc-50">
                      <td className="py-2 px-3 font-bold text-rose-700">{item.sku}</td>
                      <td className="py-2 px-3 font-sans font-semibold text-zinc-900">{item.name}</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-700">{item.currentStock}</td>
                      <td className="py-2 px-3 text-right text-zinc-600 font-semibold">{item.minReorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Invoices Feed */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900">Recent Invoices & Payment Status</h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">Latest 5 Records</span>
          </div>

          {stats?.recentInvoices?.length === 0 ? (
            <p className="text-xs text-zinc-600 py-6 text-center">No invoices recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-600 font-mono uppercase text-[10px] bg-zinc-50">
                    <th className="py-2 px-3">Invoice #</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-3 text-right">Paid</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {stats?.recentInvoices?.map((inv) => (
                    <tr key={inv._id} className="hover:bg-zinc-50">
                      <td className="py-2 px-3 font-bold text-zinc-900">{inv.invoiceNumber}</td>
                      <td className="py-2 px-3 text-right font-bold text-zinc-900">
                        ${inv.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                        ${inv.amountPaid?.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
