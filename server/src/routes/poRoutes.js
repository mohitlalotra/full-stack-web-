const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPOById,
  createPurchaseOrder,
  updatePOStatus,
} = require('../controllers/poController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getPurchaseOrders)
  .post(authorize('Admin', 'Warehouse'), createPurchaseOrder);

router.get('/:id', getPOById);
router.put('/:id/status', authorize('Admin', 'Warehouse'), updatePOStatus);

module.exports = router;
