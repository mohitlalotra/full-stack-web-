const Product = require('../models/Product');

// @desc Get all products
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    let products = await Product.find(query).sort({ name: 1 });

    if (lowStock === 'true') {
      products = products.filter((p) => p.currentStock <= p.minReorderLevel);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get low stock summary
// @route GET /api/products/low-stock
const getLowStockProducts = async (req, res) => {
  try {
    const allProducts = await Product.find().sort({ currentStock: 1 });
    const lowStockItems = allProducts.filter((p) => p.currentStock <= p.minReorderLevel);

    res.json({
      count: lowStockItems.length,
      items: lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new product
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      currentStock,
      minReorderLevel,
    } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const product = await Product.create({
      sku: sku.toUpperCase(),
      name,
      category,
      unit: unit || 'pcs',
      purchasePrice,
      sellingPrice,
      currentStock: currentStock || 0,
      minReorderLevel: minReorderLevel || 10,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update product
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    if (req.body.sku) {
      req.body.sku = req.body.sku.toUpperCase();
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
