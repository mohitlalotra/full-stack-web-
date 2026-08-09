const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

// @desc Get all Purchase Orders
// @route GET /api/purchase-orders
const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('items.productId', 'name sku unit currentStock')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single Purchase Order
// @route GET /api/purchase-orders/:id
const getPOById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate(
      'items.productId',
      'name sku unit currentStock'
    );
    if (!order) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create Purchase Order
// @route POST /api/purchase-orders
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierName, items, status } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Purchase Order must include at least one item' });
    }

    let calculatedTotal = 0;
    const formattedItems = items.map((item) => {
      const itemTotal = Number(item.quantity) * Number(item.unitPrice);
      calculatedTotal += itemTotal;
      return {
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      };
    });

    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${String(count + 1001).padStart(5, '0')}`;

    const po = await PurchaseOrder.create({
      poNumber,
      supplierName,
      items: formattedItems,
      totalAmount: calculatedTotal,
      status: status || 'Draft',
    });

    // If initial status is Received, apply stock increment
    if (po.status === 'Received') {
      for (const item of po.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: item.quantity },
        });
      }
      po.receivedAt = new Date();
      await po.save();
    }

    const populatedPO = await PurchaseOrder.findById(po._id).populate(
      'items.productId',
      'name sku unit currentStock'
    );
    res.status(201).json(populatedPO);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update Purchase Order status (Receiving triggers stock increment)
// @route PUT /api/purchase-orders/:id/status
const updatePOStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    const previousStatus = po.status;

    if (previousStatus === 'Received' && status !== 'Received') {
      return res.status(400).json({ message: 'Cannot revert a Received Purchase Order' });
    }

    po.status = status;

    // STOCK INCREMENT LOGIC ON RECEIVING
    if (previousStatus !== 'Received' && status === 'Received') {
      for (const item of po.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: item.quantity },
        });
      }
      po.receivedAt = new Date();
    }

    await po.save();

    const updatedPO = await PurchaseOrder.findById(po._id).populate(
      'items.productId',
      'name sku unit currentStock'
    );
    res.json(updatedPO);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getPurchaseOrders,
  getPOById,
  createPurchaseOrder,
  updatePOStatus,
};
