const mongoose = require('mongoose');
const Course = require('../models/course');
const Lesson = require('../models/lesson'); // Diperlukan jika melakukan operasi terkait lesson
const User = require('../models/user');   // Diperlukan untuk enrollment

exports.getCourses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const queryOptions = { isPublished: true };
        if (req.query.category) {
            queryOptions.category = { $regex: req.query.category, $options: 'i' };
        }
        if (req.query.q) {
            queryOptions.$or = [
                { title: { $regex: req.query.q, $options: 'i' } },
                { description: { $regex: req.query.q, $options: 'i' } },
                { instructor: { $regex: req.query.q, $options: 'i' } },
                { category: { $regex: req.query.q, $options: 'i' } }
            ];
        }

        const courses = await Course.find(queryOptions)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title shortDescription description coverImage category price instructor lessons'); // Ambil jumlah lessons

        const totalCourses = await Course.countDocuments(queryOptions);
        const totalPages = Math.ceil(totalCourses / limit);

        res.render('courses/index', {
            pageTitle: req.query.q ? `Hasil Pencarian untuk "${req.query.q}"` : (req.query.category ? `Kursus Kategori: ${req.query.category}` : 'Semua Kursus'),
            courses,
            currentPage: page,
            totalPages,
            limit,
            currentQuery: req.query,
            breadcrumbs: [
                { name: 'Beranda', link: '/' },
                { name: 'Kursus', link: '/courses' }
            ]
        });
    } catch (err) {
        next(err);
    }
};

exports.getCourseById = async (req, res, next) => {
    try {
        const courseId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            const err = new Error('Format ID Kursus tidak valid.');
            err.statusCode = 400;
            return next(err);
        }

        const course = await Course.findOne({ _id: courseId, isPublished: true })
            .populate({
                path: 'lessons',
                options: { sort: { order: 1, createdAt: 1 } }
            });

        if (!course) {
            const err = new Error('Kursus tidak ditemukan atau belum dipublikasikan.');
            err.statusCode = 404;
            return next(err);
        }

        let userIsEnrolled = false;
        if (req.user) {
            userIsEnrolled = req.user.enrolledCourses.map(id => id.toString()).includes(course._id.toString());
            if (req.user.role === 'admin') userIsEnrolled = true; // Admin dianggap terdaftar
        }


        res.render('courses/show', {
            pageTitle: course.title,
            course,
            userIsEnrolled,
            breadcrumbs: [
                { name: 'Beranda', link: '/' },
                { name: 'Kursus', link: '/courses' },
                { name: course.title, link: `/courses/${course._id}` }
            ]
        });
    } catch (err) {
        next(err);
    }
};

exports.enrollCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            req.flash('error_msg', 'ID Kursus tidak valid.');
            return res.redirect('back');
        }

        const course = await Course.findById(courseId);
        const user = await User.findById(userId);

        if (!course || !course.isPublished) {
            req.flash('error_msg', 'Kursus tidak ditemukan atau belum tersedia.');
            return res.redirect('/courses');
        }
        if (!user) {
            req.flash('error_msg', 'Pengguna tidak ditemukan.');
            return res.redirect('/auth/login');
        }

        if (user.enrolledCourses.map(id=>id.toString()).includes(courseId.toString())) {
            req.flash('info_msg', `Anda sudah terdaftar di kursus "${course.title}".`);
            return res.redirect(`/courses/${courseId}`);
        }

        user.enrolledCourses.push(courseId);
        await user.save();

        req.flash('success_msg', `Selamat! Anda berhasil mendaftar di kursus "${course.title}".`);
        res.redirect(`/courses/${courseId}`);

    } catch (err) {
        console.error("Enrollment error:", err);
        req.flash('error_msg', 'Gagal mendaftar kursus. Silakan coba lagi.');
        res.redirect('back');
    }
};