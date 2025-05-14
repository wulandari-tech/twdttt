const express = require('express');
const router = express.Router(); // Inisialisasi router
const { ensureAuthenticated } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Rute untuk dashboard pengguna
router.get('/dashboard', ensureAuthenticated, userController.getUserDashboard);

// Anda bisa menambahkan rute lain terkait pengguna di sini, misalnya:
// router.get('/profile', ensureAuthenticated, userController.getUserProfile);
// router.post('/profile/edit', ensureAuthenticated, userController.updateUserProfile);

module.exports = router;