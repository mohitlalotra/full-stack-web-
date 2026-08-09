const DeliveryChallan = require('../models/DeliveryChallan');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc Get all Delivery Challans
// @route GET /api/challans
const getChallans = async (req, res) => {
  try {
    const challans = await DeliveryChallan.find()
      .populate('customerId', 'companyName contactPerson email phone address')
      .populate('items.productId', 'name sku unit currentStock')
      .sort({ createdAt: -1 });
    res.json(challans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single Delivery Challan
// @route GET /api/challans/:id
const getChallanById = async (req, res) => {
  try {
    const challan = await DeliveryChallan.findById(req.params.id)
      .populate('customerId', 'companyName contactPerson email phone address')
      .populate('items.productId', 'name sku unit currentStock');
    if (!challan) {
      return res.status(404).json({ message: 'Delivery Challan not found' });
    }
    res.json(challan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create Delivery Challan
// @route POST /api/challans
const createChallan = async (req, res) => {
  try {
    const { customerId, items, status } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Challan must contain at least one item' });
    }

    // Validate Stock Availability for all items before dispatching
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.currentStock < Number(item.quantity)) {
        return res.status(400).json({
          message: `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`,
        });
      }
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

    const count = await DeliveryChallan.countDocuments();
    const challanNumber = `CH-${String(count + 5001).padStart(5, '0')}`;
    const initialStatus = status || 'Dispatched';

    const challan = await DeliveryChallan.create({
      challanNumber,
      customerId,
      dispatchDate: new Date(),
      items: formattedItems,
      totalAmount: calculatedTotal,
      status: initialStatus,
    });

    // STOCK DECREMENT LOGIC ON DISPATCH
    if (initialStatus === 'Dispatched') {
      for (const item of formattedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: -item.quantity },
        });
      }
    }

    const populatedChallan = await DeliveryChallan.findById(challan._id)
      .populate('customerId', 'companyName contactPerson email phone address')
      .populate('items.productId', 'name sku unit currentStock');

    res.status(201).json(populatedChallan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update Delivery Challan status
// @route PUT /api/challans/:id/status
const updateChallanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const challan = await DeliveryChallan.findById(req.params.id);

    if (!challan) {
      return res.status(404).json({ message: 'Delivery Challan not found' });
    }

    challan.status = status;
    await challan.save();

    const updatedChallan = await DeliveryChallan.findById(challan._id)
      .populate('customerId', 'companyName contactPerson email phone address')
      .populate('items.productId', 'name sku unit currentStock');

    res.json(updatedChallan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
};
