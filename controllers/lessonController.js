const mongoose = require('mongoose');
const Course = require('../models/course');
const Lesson = require('../models/lesson');
// const Comment = require('../models/Comment'); // Jika ingin populate komentar di sini

exports.getLesson = async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
            const err = new Error('Format ID Kursus atau Pelajaran tidak valid.');
            err.statusCode = 400;
            return next(err);
        }

        const course = await Course.findOne({ _id: courseId, isPublished: true })
            .populate({
                path: 'lessons', // Populate semua pelajaran dari kursus
                options: { sort: { order: 1, createdAt: 1 } },
                populate: { // Nested populate untuk komentar di setiap pelajaran
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: 'name email' // Ambil field yang diperlukan dari User
                    },
                    options: { sort: { createdAt: -1 } } // Komentar terbaru di atas
                }
            });


        if (!course) {
            const err = new Error('Kursus tidak ditemukan atau belum dipublikasikan.');
            err.statusCode = 404;
            return next(err);
        }

        const lesson = course.lessons.find(l => l._id.toString() === lessonId);

        if (!lesson) {
            const err = new Error('Pelajaran tidak ditemukan dalam kursus ini.');
            err.statusCode = 404;
            return next(err);
        }

        res.render('courses/lesson', {
            pageTitle: `${lesson.title} | ${course.title}`,
            course, // Kirim seluruh objek course yang sudah di-populate pelajarannya
            lesson, // Kirim pelajaran spesifik yang sedang dilihat
            breadcrumbs: [
                { name: 'Beranda', link: '/' },
                { name: 'Kursus', link: '/courses' },
                { name: course.title, link: `/courses/${course._id}` },
                { name: lesson.title, link: `/courses/${course._id}/lessons/${lesson._id}` }
            ]
        });
    } catch (err) {
        next(err);
    }
};