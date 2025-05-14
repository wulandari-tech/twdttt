const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LessonSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Judul pelajaran wajib diisi'],
        trim: true
    },
    contentType: {
        type: String,
        enum: ['video', 'pdf', 'image', 'text'],
        required: [true, 'Tipe konten pelajaran wajib diisi']
    },
    contentCloudinary: {
        url: String,
        public_id: String,
        resource_type: String,
        originalFilename: String
    },
    textContent: {
        type: String
    },
    duration: {
        type: String,
        trim: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);