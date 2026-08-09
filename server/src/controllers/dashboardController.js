const Product = require('../models/Product');
const Customer = require('../models/Customer');
const PurchaseOrder = require('../models/PurchaseOrder');
const DeliveryChallan = require('../models/DeliveryChallan');
const Invoice = require('../models/Invoice');

// @desc Get dashboard KPIs and operational summaries
// @route GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      customers,
      allProducts,
      purchaseOrders,
      challans,
      invoices,
    ] = await Promise.all([
      Customer.find(),
      Product.find(),
      PurchaseOrder.find(),
      DeliveryChallan.find(),
      Invoice.find(),
    ]);

    const totalCustomers = customers.length;
    const totalProducts = allProducts.length;
    const lowStockItems = allProducts.filter((p) => p.currentStock <= p.minReorderLevel);

    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const totalPendingPayments = totalBilled - totalRevenue;

    const pendingPOsCount = purchaseOrders.filter((po) => po.status !== 'Received').length;
    const dispatchedChallansCount = challans.filter((ch) => ch.status === 'Dispatched').length;

    let pendingFollowUpsCount = 0;
    customers.forEach((c) => {
      c.followUps.forEach((fu) => {
        if (fu.status === 'Pending') pendingFollowUpsCount++;
      });
    });

    const recentInvoices = invoices.slice(-5).reverse();
    const recentChallans = challans.slice(-5).reverse();

    res.json({
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map((p) => ({
        _id: p._id,
        sku: p.sku,
        name: p.name,
        currentStock: p.currentStock,
        minReorderLevel: p.minReorderLevel,
      })),
      pendingPOsCount,
      dispatchedChallansCount,
      totalRevenue,
      totalPendingPayments,
      pendingFollowUpsCount,
      recentInvoices,
      recentChallans,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
