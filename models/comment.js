const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    text: {
        type: String,
        required: [true, 'Komentar tidak boleh kosong'],
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    parentComment: { 
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{ 
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);