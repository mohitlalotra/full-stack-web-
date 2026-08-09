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
    if (!supplierName.trim()) {
      alert('Please enter a supplier name');
      return;
    }
    for (const item of poItems) {
      if (!item.productId) {
        alert('Please select a valid product for all line items');
        return;
      }
    }
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

  const handleOpenModal = () => {
    if (products.length > 0) {
      setPoItems([{ productId: products[0]._id, quantity: 10, unitPrice: products[0].purchasePrice }]);
    }
    setShowModal(true);
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
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-zinc-700" />
            Purchase Orders & Procurement
          </h1>
          <p className="text-xs text-zinc-600 font-mono font-medium">
            Receiving a PO automatically increments product warehouse inventory stock
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-black text-white font-semibold text-xs rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </button>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-600 font-mono">Loading purchase orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-600">No purchase orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4 text-right">Items & Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {canEdit && <th className="py-3 px-4 text-center">Update Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {orders.map((po) => (
                  <tr key={po._id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{po.poNumber}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{po.supplierName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 font-medium">
                      {new Date(po.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-zinc-900">${po.totalAmount?.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-600 font-medium">{po.items?.length || 0} items</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                          po.status === 'Received'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : po.status === 'Ordered'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-zinc-100 text-zinc-800 border-zinc-300'
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
                            className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold rounded hover:bg-amber-200"
                          >
                            Mark Ordered
                          </button>
                        )}
                        {po.status === 'Ordered' && (
                          <button
                            onClick={() => handleUpdateStatus(po._id, 'Received')}
                            className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold rounded flex items-center gap-1 mx-auto hover:bg-emerald-200"
                            title="Triggers automatic stock increment in inventory"
                          >
                            <PackagePlus className="w-3 h-3" />
                            Receive Goods
                          </button>
                        )}
                        {po.status === 'Received' && (
                          <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center justify-center gap-1">
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
          <div className="bg-white border border-zinc-200 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">Create Procurement Purchase Order</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900"
                  placeholder="National Steel & Metals Ltd"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Order Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[11px] text-zinc-900 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Item Line
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-zinc-50 p-2 border border-zinc-200 rounded">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-zinc-300 rounded text-xs text-zinc-900 font-medium"
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
                      className="w-16 px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-mono text-zinc-900"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-mono text-zinc-900"
                    />

                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-rose-600 p-1 hover:text-rose-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded"
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
