import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Plus,
  Printer,
  X,
  CreditCard,
  Trash2,
} from 'lucide-react';

const InvoicesPage = () => {
  const { hasRole } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [challans, setChallans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Create Invoice State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedChallanId, setSelectedChallanId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([
    { productId: '', name: '', quantity: 1, unitPrice: 0 },
  ]);

  // Payment Recording State
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payNotes, setPayNotes] = useState('');

  const canEdit = hasRole('Admin', 'Accounts');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, custRes, chRes, prodRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers'),
        api.get('/challans'),
        api.get('/products'),
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
      setChallans(chRes.data);
      setProducts(prodRes.data);

      if (custRes.data.length > 0) setSelectedCustomerId(custRes.data[0]._id);
      if (prodRes.data.length > 0) {
        setInvoiceItems([
          {
            productId: prodRes.data[0]._id,
            name: prodRes.data[0].name,
            quantity: 1,
            unitPrice: prodRes.data[0].sellingPrice,
          },
        ]);
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

  // Autofill items from Delivery Challan selection
  const handleSelectChallan = (challanId) => {
    setSelectedChallanId(challanId);
    if (!challanId) return;

    const ch = challans.find((c) => c._id === challanId);
    if (ch) {
      if (ch.customerId) {
        setSelectedCustomerId(ch.customerId._id || ch.customerId);
      }
      const mappedItems = ch.items.map((item) => ({
        productId: item.productId?._id || item.productId,
        name: item.productId?.name || 'Item',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      setInvoiceItems(mappedItems);
    }
  };

  const handleAddItemRow = () => {
    if (products.length > 0) {
      setInvoiceItems([
        ...invoiceItems,
        {
          productId: products[0]._id,
          name: products[0].name,
          quantity: 1,
          unitPrice: products[0].sellingPrice,
        },
      ]);
    }
  };

  const handleRemoveItemRow = (idx) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...invoiceItems];
    updated[idx][field] = value;
    if (field === 'productId') {
      const p = products.find((prod) => prod._id === value);
      if (p) {
        updated[idx].name = p.name;
        updated[idx].unitPrice = p.sellingPrice;
      }
    }
    setInvoiceItems(updated);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', {
        customerId: selectedCustomerId,
        challanId: selectedChallanId || null,
        dueDate: dueDate || null,
        items: invoiceItems,
      });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.post(`/invoices/${selectedInvoice._id}/pay`, {
        amount: Number(payAmount),
        paymentMethod: payMethod,
        notes: payNotes,
      });
      setShowPayModal(false);
      setPayAmount('');
      setPayNotes('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            Invoices & Payment Collection
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Generate invoices from Delivery Challans, record payments, and track receivables
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Generate New Invoice
          </button>
        )}
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading financial invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No invoices recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Invoice Date / Due</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 font-mono">
                {invoices.map((inv) => {
                  const balanceDue = inv.totalAmount - inv.amountPaid;
                  return (
                    <tr key={inv._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-zinc-100">
                        {inv.customerId?.companyName || 'Unknown Customer'}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-zinc-500">
                        <div>Inv: {new Date(inv.invoiceDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                        ${inv.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ${inv.amountPaid?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        ${balanceDue > 0 ? balanceDue.toFixed(2) : '0.00'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && inv.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPayAmount((inv.totalAmount - inv.amountPaid).toFixed(2));
                                setShowPayModal(true);
                              }}
                              className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-sans font-semibold text-[11px] rounded flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" /> Record Payment
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowPrintModal(true);
                            }}
                            className="p-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-300 dark:border-zinc-700"
                            title="Print Invoice Document"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Generate Billing Invoice</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Customer Account</label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    {customers.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Link Delivery Challan (Optional)</label>
                  <select
                    value={selectedChallanId}
                    onChange={(e) => handleSelectChallan(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                  >
                    <option value="">-- Standalone Invoice --</option>
                    {challans.map((ch) => (
                      <option key={ch._id} value={ch._id}>
                        {ch.challanNumber} (${ch.totalAmount?.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Billed Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[11px] text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Item Line
                  </button>
                </div>

                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800 rounded">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                    />

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

                    {invoiceItems.length > 1 && (
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded"
                >
                  Save & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Record Payment Received</h3>
                <p className="text-xs text-zinc-500 font-mono">Invoice #{selectedInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs space-y-1 font-mono">
                <div className="flex justify-between text-zinc-500">
                  <span>Total Billed:</span>
                  <span>${selectedInvoice.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Already Paid:</span>
                  <span>${selectedInvoice.amountPaid?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-t border-zinc-200 dark:border-zinc-800 pt-1">
                  <span>Remaining Balance:</span>
                  <span>${(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toFixed(2)}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Bank Transfer">Bank Transfer (ACH / Wire)</option>
                  <option value="Cheque">Corporate Cheque</option>
                  <option value="UPI">UPI / Digital Transfer</option>
                  <option value="Cash">Cash Deposit</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Reference / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Ref #99281 or Cheque #4029"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded"
                >
                  Confirm Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Invoice Printable Document</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button onClick={() => setShowPrintModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Container */}
            <div id="printable-invoice" className="bg-white text-zinc-900 p-8 rounded-lg space-y-6">
              <div className="flex items-start justify-between border-b pb-6 border-zinc-200">
                <div>
                  <h1 className="text-xl font-bold text-zinc-900">APEX WHOLESALE ERP</h1>
                  <p className="text-xs text-zinc-600 font-mono">Official Sales & Distribution Invoice</p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-lg font-bold text-zinc-900">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-zinc-500">Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="font-bold text-zinc-500 uppercase font-mono text-[10px]">Billed To:</span>
                  <div className="font-bold text-zinc-900 text-sm mt-1">{selectedInvoice.customerId?.companyName}</div>
                  <div className="text-zinc-600">{selectedInvoice.customerId?.contactPerson}</div>
                  <div className="text-zinc-600">{selectedInvoice.customerId?.address}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-zinc-500 uppercase text-[10px]">Payment Terms:</span>
                  <div className="font-semibold text-zinc-800 mt-1">
                    Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </div>
                  <div className="mt-2 inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase bg-zinc-100 text-zinc-800">
                    Status: {selectedInvoice.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-100 text-zinc-700 font-mono uppercase text-[10px]">
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {selectedInvoice.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-sans font-medium text-zinc-800">{item.name}</td>
                      <td className="py-2.5 px-3 text-center text-zinc-700">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-zinc-700">${item.unitPrice?.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-zinc-900">${item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-zinc-200">
                <div className="w-64 space-y-1.5 font-mono text-xs text-zinc-800">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Amount Paid:</span>
                    <span>${selectedInvoice.amountPaid?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-900 font-bold border-t pt-1.5 text-sm">
                    <span>Balance Due:</span>
                    <span>${(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
