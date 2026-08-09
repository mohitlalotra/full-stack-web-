const express = require('express');
const router = express.Router();
const {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
} = require('../controllers/challanController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getChallans)
  .post(authorize('Admin', 'Sales', 'Warehouse'), createChallan);

router.get('/:id', getChallanById);
router.put('/:id/status', authorize('Admin', 'Sales', 'Warehouse'), updateChallanStatus);

module.exports = router;
