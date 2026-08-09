const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getMe,
  getUsers,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin'), getUsers);

module.exports = router;
