const Comment = require('../models/comment');
const Lesson = require('../models/lesson');
const Course = require('../models/course');
const mongoose = require('mongoose');

exports.postComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const lessonId = req.params.lessonId;
        const courseId = req.params.courseId; // Anda perlu pastikan courseId tersedia
        const userId = req.user._id;

        if (!text || text.trim() === '') {
            req.flash('error_msg', 'Komentar tidak boleh kosong.');
            return res.redirect('back');
        }
        if (!mongoose.Types.ObjectId.isValid(lessonId) || !mongoose.Types.ObjectId.isValid(courseId)) {
             req.flash('error_msg', 'ID tidak valid.');
            return res.redirect('back');
        }

        const lesson = await Lesson.findById(lessonId);
        const course = await Course.findById(courseId); // Verifikasi kursus ada

        if (!lesson || !course) {
            req.flash('error_msg', 'Pelajaran atau Kursus tidak ditemukan.');
            return res.redirect('back');
        }

        const newComment = new Comment({
            text,
            user: userId,
            lesson: lessonId,
            course: courseId
        });

        const savedComment = await newComment.save();
        lesson.comments.push(savedComment._id);
        await lesson.save();

        req.flash('success_msg', 'Komentar berhasil ditambahkan.');
        res.redirect(`/courses/${courseId}/lessons/${lessonId}`);

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Gagal menambahkan komentar.');
        res.redirect('back');
    }
};

exports.deleteComment = async (req, res, next) => {
    // Implementasi hapus komentar (cek kepemilikan atau admin role)
    try {
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            req.flash('error_msg', 'Komentar tidak ditemukan.');
            return res.redirect('back');
        }

        // Cek apakah pengguna adalah pemilik komentar atau admin
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            req.flash('error_msg', 'Anda tidak berhak menghapus komentar ini.');
            return res.redirect('back');
        }

        // Hapus dari array comments di Lesson
        await Lesson.findByIdAndUpdate(comment.lesson, { $pull: { comments: commentId } });
        await Comment.findByIdAndDelete(commentId);

        req.flash('success_msg', 'Komentar berhasil dihapus.');
        res.redirect('back');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Gagal menghapus komentar.');
        res.redirect('back');
    }
};