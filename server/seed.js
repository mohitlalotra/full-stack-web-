const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Customer = require('./src/models/Customer');
const PurchaseOrder = require('./src/models/PurchaseOrder');
const DeliveryChallan = require('./src/models/DeliveryChallan');
const Invoice = require('./src/models/Invoice');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wholesale_erp';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await DeliveryChallan.deleteMany({});
    await Invoice.deleteMany({});

    console.log('[Seeder] Cleared existing data.');

    // 1. Create Users for all 4 Roles
    const adminUser = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@wholesale.com',
      password: 'password123',
      role: 'Admin',
    });

    const salesUser = await User.create({
      name: 'Marcus Brody (Sales)',
      email: 'sales@wholesale.com',
      password: 'password123',
      role: 'Sales',
    });

    const warehouseUser = await User.create({
      name: 'David Miller (Warehouse)',
      email: 'warehouse@wholesale.com',
      password: 'password123',
      role: 'Warehouse',
    });

    const accountsUser = await User.create({
      name: 'Sophia Chen (Accounts)',
      email: 'accounts@wholesale.com',
      password: 'password123',
      role: 'Accounts',
    });

    console.log('[Seeder] Created demo user accounts for all 4 roles (Password: password123).');

    // 2. Create Products
    const p1 = await Product.create({
      sku: 'BOLT-100',
      name: 'Industrial Grade M10 Bolts (Box of 100)',
      category: 'Hardware',
      unit: 'box',
      purchasePrice: 15.0,
      sellingPrice: 28.5,
      currentStock: 450,
      minReorderLevel: 50,
    });

    const p2 = await Product.create({
      sku: 'COP-500',
      name: 'Heavy Duty Copper Wire Spool (50m)',
      category: 'Electrical',
      unit: 'spool',
      purchasePrice: 85.0,
      sellingPrice: 140.0,
      currentStock: 6, // LOW STOCK TRIGGER
      minReorderLevel: 15,
    });

    const p3 = await Product.create({
      sku: 'PUMP-900',
      name: 'Hydraulic Pressure Pump 2.5HP',
      category: 'Machinery',
      unit: 'pcs',
      purchasePrice: 320.0,
      sellingPrice: 550.0,
      currentStock: 3, // LOW STOCK TRIGGER
      minReorderLevel: 5,
    });

    const p4 = await Product.create({
      sku: 'PVC-200',
      name: 'Schedule 40 PVC Pipe 2-inch (10ft)',
      category: 'Plumbing',
      unit: 'pcs',
      purchasePrice: 12.5,
      sellingPrice: 24.0,
      currentStock: 180,
      minReorderLevel: 30,
    });

    const p5 = await Product.create({
      sku: 'ALU-400',
      name: 'Anodized Aluminum Sheet 4x8ft',
      category: 'Raw Materials',
      unit: 'sheet',
      purchasePrice: 60.0,
      sellingPrice: 110.0,
      currentStock: 50,
      minReorderLevel: 10,
    });

    console.log('[Seeder] Created demo products (including 2 low-stock flagged items).');

    // 3. Create Customers & CRM Follow-ups
    const c1 = await Customer.create({
      companyName: 'Apex Global Distributors',
      contactPerson: 'Arthur Dent',
      email: 'arthur@apexglobal.com',
      phone: '+1 (555) 019-2834',
      address: '104 Logistics Parkway, Industrial Zone, NY',
      creditLimit: 50000,
      followUps: [
        {
          salesRepId: salesUser._id,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'Completed',
          notes: 'Discussed bulk Q3 order for copper spools and hydraulic pumps.',
          nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          salesRepId: salesUser._id,
          date: new Date(),
          status: 'Pending',
          notes: 'Send updated catalog with revised volume discount tiers.',
          nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    const c2 = await Customer.create({
      companyName: 'Vertex Industrial Solutions',
      contactPerson: 'Sloan Carter',
      email: 'scarter@vertexind.com',
      phone: '+1 (555) 892-1144',
      address: '77 Commerce Blvd, Suite 400, Chicago, IL',
      creditLimit: 35000,
      followUps: [
        {
          salesRepId: salesUser._id,
          date: new Date(),
          status: 'Pending',
          notes: 'Follow up on pending quotation for PVC pipes.',
          nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    const c3 = await Customer.create({
      companyName: 'Metro Engineering Works',
      contactPerson: 'Elena Rostova',
      email: 'elena@metroeng.org',
      phone: '+1 (555) 443-9021',
      address: '12 Manufacturing Road, Austin, TX',
      creditLimit: 20000,
      followUps: [],
    });

    console.log('[Seeder] Created demo customers and CRM follow-up logs.');

    // 4. Create Purchase Orders
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-01001',
      supplierName: 'National Steel & Metals Ltd',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      items: [
        { productId: p1._id, quantity: 100, unitPrice: 14.5 },
        { productId: p5._id, quantity: 20, unitPrice: 58.0 },
      ],
      totalAmount: 100 * 14.5 + 20 * 58.0,
      status: 'Received',
      receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    const po2 = await PurchaseOrder.create({
      poNumber: 'PO-01002',
      supplierName: 'Global Copper Refinings Corp',
      orderDate: new Date(),
      items: [
        { productId: p2._id, quantity: 30, unitPrice: 82.0 },
        { productId: p3._id, quantity: 10, unitPrice: 310.0 },
      ],
      totalAmount: 30 * 82.0 + 10 * 310.0,
      status: 'Ordered',
    });

    console.log('[Seeder] Created demo Purchase Orders.');

    // 5. Create Delivery Challans
    const ch1 = await DeliveryChallan.create({
      challanNumber: 'CH-05001',
      customerId: c1._id,
      dispatchDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: [
        { productId: p1._id, quantity: 50, unitPrice: 28.5 },
        { productId: p4._id, quantity: 20, unitPrice: 24.0 },
      ],
      totalAmount: 50 * 28.5 + 20 * 24.0,
      status: 'Dispatched',
    });

    console.log('[Seeder] Created demo Delivery Challan.');

    // 6. Create Invoices
    const inv1 = await Invoice.create({
      invoiceNumber: 'INV-09001',
      customerId: c1._id,
      challanId: ch1._id,
      invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      items: [
        { productId: p1._id, name: p1.name, quantity: 50, unitPrice: 28.5, amount: 1425.0 },
        { productId: p4._id, name: p4.name, quantity: 20, unitPrice: 24.0, amount: 480.0 },
      ],
      totalAmount: 1905.0,
      amountPaid: 1905.0,
      paymentStatus: 'Paid',
      paymentHistory: [
        {
          amount: 1905.0,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Bank Transfer',
          notes: 'Full payment received via ACH Ref #99281',
        },
      ],
    });

    const inv2 = await Invoice.create({
      invoiceNumber: 'INV-09002',
      customerId: c2._id,
      invoiceDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      items: [
        { productId: p2._id, name: p2.name, quantity: 10, unitPrice: 140.0, amount: 1400.0 },
        { productId: p3._id, name: p3.name, quantity: 2, unitPrice: 550.0, amount: 1100.0 },
      ],
      totalAmount: 2500.0,
      amountPaid: 1000.0,
      paymentStatus: 'Partial',
      paymentHistory: [
        {
          amount: 1000.0,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Cheque',
          notes: 'Advance deposit cheque #40291',
        },
      ],
    });

    const inv3 = await Invoice.create({
      invoiceNumber: 'INV-09003',
      customerId: c3._id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      items: [
        { productId: p5._id, name: p5.name, quantity: 15, unitPrice: 110.0, amount: 1650.0 },
      ],
      totalAmount: 1650.0,
      amountPaid: 0,
      paymentStatus: 'Unpaid',
      paymentHistory: [],
    });

    console.log('[Seeder] Created demo Invoices.');

    console.log('================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Use credentials below to log into the web application:');
    console.log('1. Admin:     admin@wholesale.com     / password123');
    console.log('2. Sales:     sales@wholesale.com     / password123');
    console.log('3. Warehouse: warehouse@wholesale.com / password123');
    console.log('4. Accounts:  accounts@wholesale.com  / password123');
    console.log('================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
