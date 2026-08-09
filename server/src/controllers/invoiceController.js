const Invoice = require('../models/Invoice');
const DeliveryChallan = require('../models/DeliveryChallan');
const Customer = require('../models/Customer');

// @desc Get all Invoices
// @route GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('challanId', 'challanNumber dispatchDate')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single Invoice
// @route GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'companyName contactPerson email phone address')
      .populate('challanId', 'challanNumber dispatchDate items');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create Invoice (Standalone or from Challan)
// @route POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const { customerId, challanId, dueDate, items } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Invoice must contain at least one item' });
    }

    let calculatedTotal = 0;
    const formattedItems = items.map((item) => {
      const lineAmount = Number(item.quantity) * Number(item.unitPrice);
      calculatedTotal += lineAmount;
      return {
        productId: item.productId || null,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        amount: lineAmount,
      };
    });

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(count + 9001).padStart(5, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      customerId,
      challanId: challanId || null,
      invoiceDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Default 15 days net
      items: formattedItems,
      totalAmount: calculatedTotal,
      amountPaid: 0,
      paymentStatus: 'Unpaid',
      paymentHistory: [],
    });

    // If linked to a DeliveryChallan, update challan status to Invoiced
    if (challanId) {
      await DeliveryChallan.findByIdAndUpdate(challanId, { status: 'Invoiced' });
    }

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('challanId', 'challanNumber');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Record Payment for Invoice
// @route POST /api/invoices/:id/pay
const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid payment amount greater than 0' });
    }

    const outstandingBalance = invoice.totalAmount - invoice.amountPaid;
    if (payAmount > outstandingBalance + 0.01) {
      return res.status(400).json({
        message: `Payment amount (${payAmount}) exceeds remaining balance (${outstandingBalance.toFixed(2)})`,
      });
    }

    invoice.amountPaid += payAmount;
    invoice.paymentHistory.push({
      amount: payAmount,
      date: new Date(),
      paymentMethod: paymentMethod || 'Bank Transfer',
      notes: notes || '',
    });

    if (invoice.amountPaid >= invoice.totalAmount - 0.01) {
      invoice.paymentStatus = 'Paid';
    } else {
      invoice.paymentStatus = 'Partial';
    }

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('challanId', 'challanNumber');

    res.json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
};
