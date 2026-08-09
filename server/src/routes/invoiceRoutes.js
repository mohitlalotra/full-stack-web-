const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(authorize('Admin', 'Accounts'), createInvoice);

router.get('/:id', getInvoiceById);
router.post('/:id/pay', authorize('Admin', 'Accounts'), recordPayment);

module.exports = router;
