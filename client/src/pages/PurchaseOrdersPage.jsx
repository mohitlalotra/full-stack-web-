import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Plus,
  CheckCircle,
  PackagePlus,
  X,
  Trash2,
} from 'lucide-react';

const PurchaseOrdersPage = () => {
  const { hasRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New PO State
  const [supplierName, setSupplierName] = useState('');
  const [poItems, setPoItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0 },
  ]);

  const canEdit = hasRole('Admin', 'Warehouse');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, prodRes] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/products'),
      ]);
      setOrders(poRes.data);
      setProducts(prodRes.data);
      if (prodRes.data.length > 0) {
        setPoItems([{ productId: prodRes.data[0]._id, quantity: 10, unitPrice: prodRes.data[0].purchasePrice }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemRow = () => {
    if (products.length > 0) {
      setPoItems([
        ...poItems,
        { productId: products[0]._id, quantity: 10, unitPrice: products[0].purchasePrice },
      ]);
    }
  };

  const handleRemoveItemRow = (index) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...poItems];
    updated[index][field] = value;
    if (field === 'productId') {
      const selected = products.find((p) => p._id === value);
      if (selected) {
        updated[index].unitPrice = selected.purchasePrice;
      }
    }
    setPoItems(updated);
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await api.post('/purchase-orders', {
        supplierName,
        items: poItems,
        status: 'Draft',
      });
      setShowModal(false);
      setSupplierName('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create PO');
    }
  };

  const handleUpdateStatus = async (poId, nextStatus) => {
    try {
      await api.put(`/purchase-orders/${poId}/status`, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            Purchase Orders & Procurement
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Receiving a PO automatically increments product warehouse inventory stock
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </button>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading purchase orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No purchase orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4 text-right">Items & Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {canEdit && <th className="py-3 px-4 text-center">Update Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {orders.map((po) => (
                  <tr key={po._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">{po.poNumber}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{po.supplierName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {new Date(po.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">${po.totalAmount?.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500">{po.items?.length || 0} items</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                          po.status === 'Received'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : po.status === 'Ordered'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-center">
                        {po.status === 'Draft' && (
                          <button
                            onClick={() => handleUpdateStatus(po._id, 'Ordered')}
                            className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-semibold rounded"
                          >
                            Mark Ordered
                          </button>
                        )}
                        {po.status === 'Ordered' && (
                          <button
                            onClick={() => handleUpdateStatus(po._id, 'Received')}
                            className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold rounded flex items-center gap-1 mx-auto"
                            title="Triggers automatic stock increment in inventory"
                          >
                            <PackagePlus className="w-3 h-3" />
                            Receive Goods
                          </button>
                        )}
                        {po.status === 'Received' && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Stock Updated
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Create Procurement Purchase Order</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                  placeholder="National Steel & Metals Ltd"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Order Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[11px] text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Item Line
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800 rounded">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="flex-1 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.sku} - {p.name} (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                    />

                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-rose-600 dark:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded"
                >
                  Create PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
