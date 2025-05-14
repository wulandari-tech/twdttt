const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/course');
const Lesson = require('../models/lesson');
const multer = require('multer');
const { cloudinary, courseMaterialStorage } = require('../config/cloudinary');

const uploadCover = multer({
    storage: courseMaterialStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diizinkan untuk sampul!'), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 5 }
}).single('coverImage');

const uploadLessonFile = multer({
    storage: courseMaterialStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Tipe file tidak didukung! (Gambar, Video, PDF)'), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 50 }
}).single('lessonFile');

function handleMulterUploadError(uploadMiddleware) {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err) {
                req.flash('error', `Kesalahan Upload: ${err.message}${err.field ? ' (Field: ' + err.field + ')' : ''}`);
                return res.redirect('back');
            }
            next();
        });
    };
}

router.get('/', (req, res) => {
    res.render('admin/dashboard', { pageTitle: 'Dashboard Admin' });
});

router.get('/courses', async (req, res, next) => {
    try {
        const courses = await Course.find({}).sort({ createdAt: -1 }).populate('lessons');
        res.render('admin/courses/index', {
            pageTitle: 'Manajemen Kursus',
            courses
        });
    } catch (err) {
        next(err);
    }
});

router.get('/courses/new', (req, res) => {
    res.render('admin/courses/new', {
        pageTitle: 'Buat Kursus Baru',
        course: {} // Untuk konsistensi dengan form edit
    });
});

router.post('/courses', handleMulterUploadError(uploadCover), async (req, res, next) => {
    try {
        const { title, description, shortDescription, instructor, category, price, tags, isPublished } = req.body;
        const newCourseData = {
            title,
            description,
            shortDescription,
            instructor,
            category,
            price: parseFloat(price) || 0,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            isPublished: isPublished === 'on' // Checkbox mengirim 'on' jika dicentang
        };

        if (req.file) {
            newCourseData.coverImage = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }
        const newCourse = new Course(newCourseData);
        await newCourse.save();
        req.flash('success', `Kursus "${newCourse.title}" berhasil dibuat!`);
        res.redirect('/admin/courses');
    } catch (err) {
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        if (err.name === 'ValidationError') {
            let errorMessages = [];
            for (let field in err.errors) {
                errorMessages.push(err.errors[field].message);
            }
            req.flash('error', errorMessages.join('<br>'));
            // Mengirim kembali data yang sudah diisi ke form
            return res.render('admin/courses/new', {
                pageTitle: 'Buat Kursus Baru',
                course: req.body, // Kirim kembali req.body
                error_msg: req.flash('error') // Pastikan flash di-handle di EJS
            });
        }
        next(err);
    }
});

router.get('/courses/:id', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            req.flash('error', 'Format ID Kursus tidak valid.');
            return res.redirect('/admin/courses');
        }
        const course = await Course.findById(req.params.id).populate({
            path: 'lessons',
            options: { sort: { order: 1, createdAt: 1 } }
        });
        if (!course) {
            req.flash('error', 'Kursus tidak ditemukan.');
            return res.redirect('/admin/courses');
        }
        res.render('admin/courses/show', {
            pageTitle: `Detail: ${course.title}`,
            course
        });
    } catch (err) {
        next(err);
    }
});

router.get('/courses/:id/edit', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            req.flash('error', 'Format ID Kursus tidak valid.');
            return res.redirect('/admin/courses');
        }
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error', 'Kursus tidak ditemukan.');
            return res.redirect('/admin/courses');
        }
        res.render('admin/courses/edit', {
            pageTitle: `Edit: ${course.title}`,
            course
        });
    } catch (err) {
        next(err);
    }
});

router.put('/courses/:id', handleMulterUploadError(uploadCover), async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            req.flash('error', 'Format ID Kursus tidak valid.');
            return res.redirect('/admin/courses');
        }
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error', 'Kursus tidak ditemukan.');
            if (req.file && req.file.filename) await cloudinary.uploader.destroy(req.file.filename);
            return res.redirect('/admin/courses');
        }

        const { title, description, shortDescription, instructor, category, price, tags, isPublished } = req.body;
        course.title = title;
        course.description = description;
        course.shortDescription = shortDescription;
        course.instructor = instructor;
        course.category = category;
        course.price = parseFloat(price) || 0;
        course.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        course.isPublished = isPublished === 'on'; // Checkbox mengirim 'on' jika dicentang

        if (req.file) {
            if (course.coverImage && course.coverImage.public_id) {
                await cloudinary.uploader.destroy(course.coverImage.public_id);
            }
            course.coverImage = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }
        await course.save();
        req.flash('success', `Kursus "${course.title}" berhasil diperbarui!`);
        res.redirect(`/admin/courses/${course._id}`);
    } catch (err) {
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        if (err.name === 'ValidationError') {
            let errorMessages = [];
            for (let field in err.errors) {
                errorMessages.push(err.errors[field].message);
            }
            req.flash('error', errorMessages.join('<br>'));
            // Mengirim kembali data yang sudah diisi ke form
            const courseToEdit = req.body; // Ambil data dari body
            courseToEdit._id = req.params.id; // Tambahkan ID agar action form benar
            if (req.file) courseToEdit.coverImage = { url: req.file.path }; // Tampilkan gambar baru jika ada
            else if ( (await Course.findById(req.params.id)).coverImage) { // Ambil gambar lama jika tidak ada yang baru
                courseToEdit.coverImage = (await Course.findById(req.params.id)).coverImage;
            }

            return res.render('admin/courses/edit', {
                pageTitle: `Edit: ${courseToEdit.title || 'Kursus'}`,
                course: courseToEdit,
                error_msg: req.flash('error')
            });
        }
        next(err);
    }
});

router.delete('/courses/:id', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            req.flash('error', 'Format ID Kursus tidak valid.');
            return res.redirect('/admin/courses');
        }
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error', 'Kursus tidak ditemukan.');
            return res.redirect('/admin/courses');
        }

        for (const lessonId of course.lessons) {
            const lesson = await Lesson.findById(lessonId);
            if (lesson && lesson.contentCloudinary && lesson.contentCloudinary.public_id) {
                await cloudinary.uploader.destroy(lesson.contentCloudinary.public_id, { resource_type: lesson.contentCloudinary.resource_type || 'auto' });
            }
            if(lesson) await Lesson.findByIdAndDelete(lessonId);
        }

        if (course.coverImage && course.coverImage.public_id) {
            await cloudinary.uploader.destroy(course.coverImage.public_id);
        }

        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        req.flash('success', `Kursus "${deletedCourse.title}" dan semua pelajarannya berhasil dihapus!`);
        res.redirect('/admin/courses');
    } catch (err) {
        next(err);
    }
});


router.post('/courses/:courseId/lessons', handleMulterUploadError(uploadLessonFile), async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
            req.flash('error', 'Format ID Kursus tidak valid.');
            if (req.file && req.file.filename) await cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image' });
            return res.redirect('/admin/courses');
        }
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            req.flash('error', 'Kursus tidak ditemukan.');
            if (req.file && req.file.filename) await cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image' });
            return res.redirect('/admin/courses');
        }

        const { title, contentType, textContent, duration, order } = req.body;
        const newLessonData = {
            title,
            contentType,
            course: course._id,
            duration,
            order: parseInt(order) || 0
        };

        if (req.file) {
            newLessonData.contentCloudinary = {
                url: req.file.path,
                public_id: req.file.filename,
                resource_type: req.file.mimetype.startsWith('video/') ? 'video' :
                               req.file.mimetype === 'application/pdf' ? 'raw' : 'image'
            };
        } else if (contentType === 'text' && textContent) {
            newLessonData.textContent = textContent;
        } else if (contentType !== 'text') {
             req.flash('error', 'File materi diperlukan untuk tipe konten Video, PDF, atau Gambar.');
             return res.redirect(`/admin/courses/${req.params.courseId}`);
        }

        const newLesson = new Lesson(newLessonData);
        await newLesson.save();
        course.lessons.push(newLesson._id);
        await course.save();
        req.flash('success', 'Pelajaran baru berhasil ditambahkan!');
        res.redirect(`/admin/courses/${course._id}`);
    } catch (err) {
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image' });
        }
        if (err.name === 'ValidationError') {
            let errorMessages = [];
            for (let field in err.errors) {
                errorMessages.push(err.errors[field].message);
            }
            req.flash('error', errorMessages.join('<br>'));
        } else {
            req.flash('error', 'Gagal menambahkan pelajaran.');
        }
        res.redirect(`/admin/courses/${req.params.courseId}`);
    }
});

router.get('/courses/:courseId/lessons/:lessonId/edit', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.courseId) || !mongoose.Types.ObjectId.isValid(req.params.lessonId)) {
            req.flash('error', 'Format ID Kursus atau Pelajaran tidak valid.');
            return res.redirect(`/admin/courses/${req.params.courseId || ''}`);
        }
        const course = await Course.findById(req.params.courseId);
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!course || !lesson) {
            req.flash('error', 'Kursus atau pelajaran tidak ditemukan.');
            return res.redirect(`/admin/courses/${req.params.courseId || ''}`);
        }
        res.render('admin/lessons/edit', {
            pageTitle: `Edit Pelajaran: ${lesson.title}`,
            course,
            lesson
        });
    } catch (err) {
        next(err);
    }
});

router.put('/courses/:courseId/lessons/:lessonId', handleMulterUploadError(uploadLessonFile), async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.courseId) || !mongoose.Types.ObjectId.isValid(req.params.lessonId)) {
            req.flash('error', 'Format ID Kursus atau Pelajaran tidak valid.');
            if (req.file && req.file.filename) await cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image' });
            return res.redirect(`/admin/courses/${req.params.courseId}`);
        }
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson) {
            req.flash('error', 'Pelajaran tidak ditemukan.');
            if (req.file && req.file.filename) await cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image' });
            return res.redirect(`/admin/courses/${req.params.courseId}`);
        }

        const { title, contentType, textContent, duration, order } = req.body;
        lesson.title = title;
        lesson.contentType = contentType;
        lesson.duration = duration;
        lesson.order = parseInt(order) || 0;

        if (req.file) {
            if (lesson.contentCloudinary && lesson.contentCloudinary.public_id) {
                await cloudinary.uploader.destroy(lesson.contentCloudinary.public_id, { resource_type: lesson.contentCloudinary.resource_type || 'auto' });
            }
            lesson.contentCloudinary = {
                url: req.file.path,
                public_id: req.file.filename,
                resource_type: req.file.mimetype.startsWith('video/') ? 'video' :
                               req.file.mimetype === 'application/pdf' ? 'raw' : 'image'
            };
            lesson.textContent = undefined;
        } else if (contentType === 'text') {
            if (lesson.contentCloudinary && lesson.contentCloudinary.public_id && lesson.contentType !== 'text') { // Hanya hapus jika tipe konten sebelumnya BUKAN text
                await cloudinary.uploader.destroy(lesson.contentCloudinary.public_id, { resource_type: lesson.contentCloudinary.resource_type || 'auto' });
                lesson.contentCloudinary = undefined;
            }
            lesson.textContent = textContent;
        }
        
        await lesson.save();
        req.flash('success', 'Pelajaran berhasil diperbarui!');
        res.redirect(`/admin/courses/${req.params.courseId}`);
    } catch (err) {
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image' });
        }
        if (err.name === 'ValidationError') {
            let errorMessages = [];
            for (let field in err.errors) {
                errorMessages.push(err.errors[field].message);
            }
            req.flash('error', errorMessages.join('<br>'));
        } else {
             req.flash('error', 'Gagal memperbarui pelajaran.');
        }
        res.redirect(`/admin/courses/${req.params.courseId}/lessons/${req.params.lessonId}/edit`);
    }
});

router.delete('/courses/:courseId/lessons/:lessonId', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.courseId) || !mongoose.Types.ObjectId.isValid(req.params.lessonId)) {
            req.flash('error', 'Format ID Kursus atau Pelajaran tidak valid.');
            return res.redirect(`/admin/courses/${req.params.courseId || ''}`);
        }
        const course = await Course.findById(req.params.courseId);
        const lesson = await Lesson.findById(req.params.lessonId);

        if (!course || !lesson) {
            req.flash('error', 'Kursus atau pelajaran tidak ditemukan.');
            return res.redirect(`/admin/courses/${req.params.courseId || ''}`);
        }

        if (lesson.contentCloudinary && lesson.contentCloudinary.public_id) {
            await cloudinary.uploader.destroy(lesson.contentCloudinary.public_id, { resource_type: lesson.contentCloudinary.resource_type || 'auto' });
        }

        await Lesson.findByIdAndDelete(req.params.lessonId);

        course.lessons.pull(req.params.lessonId);
        await course.save();

        req.flash('success', 'Pelajaran berhasil dihapus!');
        res.redirect(`/admin/courses/${req.params.courseId}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;