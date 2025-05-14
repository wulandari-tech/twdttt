const User = require('../models/user');
const Course = require('../models/course'); // Jika perlu populate detail kursus

exports.getUserDashboard = async (req, res, next) => {
    try {
        // Ambil ulang user dengan enrolledCourses yang di-populate untuk detail
        const userWithCourses = await User.findById(req.user._id)
            .populate({
                path: 'enrolledCourses',
                match: { isPublished: true }, // Hanya tampilkan kursus yang masih publish
                select: 'title shortDescription coverImage _id' // Pilih field yang diperlukan
            })
            .exec();

        if (!userWithCourses) { // Seharusnya tidak terjadi jika user login
            req.flash('error_msg', 'Pengguna tidak ditemukan.');
            return res.redirect('/auth/login');
        }
        
        res.render('user/dashboard', {
            pageTitle: 'Dashboard Saya',
            // Tidak perlu mengirim `currentUser` lagi karena sudah ada di res.locals
            // dan kita kirim user yang sudah di-populate di sini
            enrolledCoursesList: userWithCourses.enrolledCourses
        });
    } catch (err) {
        next(err);
    }
};