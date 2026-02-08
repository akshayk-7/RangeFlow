const express = require('express');
const router = express.Router();
const { loginRange, logoutRange, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import protect if not already there, though auth controller might need it for logout

router.post('/login', loginRange);
router.post('/logout', protect, logoutRange);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
