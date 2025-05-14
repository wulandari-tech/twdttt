const User = require('../models/user');
const Course = require('../models/course');
const Comment = require('../models/comment');
exports.getDashboard = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalPublishedCourses = await Course.countDocuments({ isPublished: true });
        // Ambil beberapa user terbaru dan kursus terbaru untuk ditampilkan
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt isBanned');
        const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5).select('title instructor isPublished createdAt');

        res.render('admin/dashboard', {
            pageTitle: 'Dashboard Admin Utama',
            totalUsers,
            totalCourses,
            totalPublishedCourses,
            recentUsers,
            recentCourses
        });
    } catch (err) {
        next(err);
    }
};

exports.getUsersList = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password');
        res.render('admin/users/index', {
            pageTitle: 'Manajemen Pengguna',
            users
        });
    } catch (err) {
        next(err);
    }
};

exports.banUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'Pengguna tidak ditemukan.');
            return res.redirect('/admin/users');
        }
        if (user.role === 'admin') {
            req.flash('error_msg', 'Tidak dapat memblokir admin lain.');
            return res.redirect('/admin/users');
        }
        user.isBanned = !user.isBanned; // Toggle ban status
        await user.save();
        req.flash('success_msg', `Status blokir pengguna "${user.name}" berhasil diubah.`);
        res.redirect('/admin/users');
    } catch (err) {
        next(err);
    }
};