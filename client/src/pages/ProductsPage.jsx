import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

const ProductsPage = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Hardware',
    unit: 'pcs',
    purchasePrice: 10,
    sellingPrice: 20,
    currentStock: 100,
    minReorderLevel: 15,
  });

  const canEdit = hasRole('Admin', 'Warehouse');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?search=${encodeURIComponent(search)}`;
      if (lowStockOnly) url += '&lowStock=true';
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      const res = await api.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, lowStockOnly, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      category: 'Hardware',
      unit: 'pcs',
      purchasePrice: 10,
      sellingPrice: 20,
      currentStock: 100,
      minReorderLevel: 15,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      unit: p.unit || 'pcs',
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      minReorderLevel: p.minReorderLevel,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-zinc-700" />
            Product Inventory Master
          </h1>
          <p className="text-xs text-zinc-600 font-mono font-medium">Stock levels, reorder thresholds, and wholesale pricing</p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-black text-white font-semibold text-xs rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product SKU
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 border border-zinc-200 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product name, or category..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-zinc-500 font-mono placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 rounded-lg border font-mono flex items-center gap-1.5 transition ${
              lowStockOnly
                ? 'bg-rose-100 text-rose-800 border-rose-300 font-semibold'
                : 'bg-zinc-50 text-zinc-700 border-zinc-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Only
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-600 font-mono">Loading inventory catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-600">No products found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4 text-right">Purchase Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-center">Reorder Threshold</th>
                  {canEdit && <th className="py-3 px-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {products.map((p) => {
                  const isLow = p.currentStock <= p.minReorderLevel;
                  return (
                    <tr key={p._id} className="hover:bg-zinc-50">
                      <td className="py-3 px-4 font-bold text-zinc-900">{p.sku}</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-zinc-900">{p.name}</div>
                        <div className="text-[10px] text-zinc-600 uppercase font-mono font-medium">{p.category}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-700">${p.purchasePrice?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900">${p.sellingPrice?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                            isLow
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-600 font-semibold">{p.minReorderLevel} {p.unit}</td>
                      {canEdit && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1 text-zinc-700 bg-zinc-100 rounded border border-zinc-300 hover:bg-zinc-200"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-1 text-rose-600 bg-zinc-100 rounded border border-zinc-300 hover:bg-zinc-200"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">
                {editingProduct ? 'Edit Product SKU' : 'Create New Product SKU'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900 font-mono uppercase"
                    placeholder="BOLT-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900"
                    placeholder="Hardware / Electrical"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900"
                  placeholder="Industrial Steel M10 Bolts"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900 font-mono"
                    placeholder="pcs / box / kg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Current Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase">Min Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minReorderLevel}
                    onChange={(e) => setFormData({ ...formData, minReorderLevel: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-900 font-mono"
                  />
                </div>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
