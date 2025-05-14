module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Silakan login untuk mengakses sumber daya ini.');
        res.redirect('/auth/login');
    },
    forwardAuthenticated: function(req, res, next) { // Untuk mencegah user terotentikasi mengakses halaman login/register
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/user/dashboard');
    },
    ensureAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();
        }
        req.flash('error_msg', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        res.redirect('/'); // Atau ke halaman login jika belum login
    },
    ensureEnrolled: async function(req, res, next) { // Middleware untuk cek apakah user sudah terdaftar di kursus
        // Implementasi ini akan bergantung pada bagaimana Anda mengambil courseId
        // Contoh jika courseId ada di req.params.courseId atau req.params.id
        const courseId = req.params.courseId || req.params.id;
        if (!req.isAuthenticated()) {
            req.flash('error_msg', 'Silakan login untuk mengakses kursus.');
            return res.redirect('/auth/login');
        }
        if (req.user.role === 'admin' || (req.user.enrolledCourses && req.user.enrolledCourses.includes(courseId))) {
            return next();
        }
        req.flash('error_msg', 'Anda belum terdaftar di kursus ini.');
        res.redirect(`/courses/${courseId}`);
    }
};