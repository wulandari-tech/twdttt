const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { ensureAuthenticated } = require('../middleware/auth');

// Perhatikan bahwa courseId dan lessonId perlu didapatkan dari URL atau body
// Contoh URL: /comments/course/:courseId/lesson/:lessonId
router.post('/course/:courseId/lesson/:lessonId', ensureAuthenticated, commentController.postComment);
// Contoh URL: /comments/:commentId
router.delete('/:commentId', ensureAuthenticated, commentController.deleteComment);

module.exports = router;