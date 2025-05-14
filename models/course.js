const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: { type: String, required: [true, 'Judul kursus wajib diisi'], trim: true },
    description: { type: String, required: [true, 'Deskripsi kursus wajib diisi'] },
    shortDescription: { type: String },
    instructor: { type: String, trim: true },
    coverImage: {
        url: String,
        public_id: String
    },
    category: { type: String, trim: true },
    price: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: false },
    lessons: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    }]
}, { timestamps: true });

CourseSchema.pre('remove', async function(next) {
    // Logika untuk menghapus pelajaran terkait jika kursus dihapus, bisa juga dihandle di rute delete
    // const Lesson = mongoose.model('Lesson');
    // await Lesson.deleteMany({ course: this._id });
    next();
});

module.exports = mongoose.model('Course', CourseSchema);