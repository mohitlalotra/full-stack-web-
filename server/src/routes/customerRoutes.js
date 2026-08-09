const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addFollowUp,
  updateFollowUpStatus,
  getPendingFollowUps,
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/pending-followups', authorize('Admin', 'Sales'), getPendingFollowUps);

router.route('/')
  .get(getCustomers)
  .post(authorize('Admin', 'Sales'), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(authorize('Admin', 'Sales'), updateCustomer)
  .delete(authorize('Admin', 'Sales'), deleteCustomer);

router.post('/:id/follow-ups', authorize('Admin', 'Sales'), addFollowUp);
router.put('/:id/follow-ups/:followUpId', authorize('Admin', 'Sales'), updateFollowUpStatus);

module.exports = router;
