const Customer = require('../models/Customer');

// @desc Get all customers
// @route GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { companyName: { $regex: search, $options: 'i' } },
          { contactPerson: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const customers = await Customer.find(query)
      .populate('followUps.salesRepId', 'name email')
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get customer by ID
// @route GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      'followUps.salesRepId',
      'name email'
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new customer
// @route POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, address, creditLimit } = req.body;

    const customer = await Customer.create({
      companyName,
      contactPerson,
      email,
      phone,
      address,
      creditLimit: creditLimit || 0,
      followUps: [],
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update customer
// @route PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete customer
// @route DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add follow-up log to customer
// @route POST /api/customers/:id/follow-ups
const addFollowUp = async (req, res) => {
  try {
    const { notes, nextFollowUpDate, status } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const followUp = {
      salesRepId: req.user._id,
      notes,
      date: new Date(),
      status: status || 'Pending',
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
    };

    customer.followUps.unshift(followUp);
    await customer.save();

    const updatedCustomer = await Customer.findById(req.params.id).populate(
      'followUps.salesRepId',
      'name email'
    );
    res.status(201).json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update follow-up status (e.g. Pending -> Completed)
// @route PUT /api/customers/:id/follow-ups/:followUpId
const updateFollowUpStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const followUp = customer.followUps.id(req.params.followUpId);
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up log not found' });
    }

    if (status) followUp.status = status;
    await customer.save();

    const updatedCustomer = await Customer.findById(req.params.id).populate(
      'followUps.salesRepId',
      'name email'
    );
    res.json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get pending CRM follow-ups across all customers
// @route GET /api/crm/follow-ups/pending
const getPendingFollowUps = async (req, res) => {
  try {
    const customers = await Customer.find({ 'followUps.status': 'Pending' })
      .populate('followUps.salesRepId', 'name email')
      .select('companyName contactPerson phone followUps');

    let pendingList = [];
    customers.forEach((cust) => {
      cust.followUps.forEach((fu) => {
        if (fu.status === 'Pending') {
          pendingList.push({
            _id: fu._id,
            customerId: cust._id,
            companyName: cust.companyName,
            contactPerson: cust.contactPerson,
            phone: cust.phone,
            notes: fu.notes,
            date: fu.date,
            nextFollowUpDate: fu.nextFollowUpDate,
            salesRep: fu.salesRepId,
          });
        }
      });
    });

    pendingList.sort((a, b) => new Date(a.nextFollowUpDate || a.date) - new Date(b.nextFollowUpDate || b.date));
    res.json(pendingList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addFollowUp,
  updateFollowUpStatus,
  getPendingFollowUps,
};
