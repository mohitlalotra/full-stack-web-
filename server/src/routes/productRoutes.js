const express = require('express');
const router = express.Router();
const {
  getProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/low-stock', getLowStockProducts);

router.route('/')
  .get(getProducts)
  .post(authorize('Admin', 'Warehouse'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('Admin', 'Warehouse'), updateProduct)
  .delete(authorize('Admin', 'Warehouse'), deleteProduct);

module.exports = router;
