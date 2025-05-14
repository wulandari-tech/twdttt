const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const { ensureAuthenticated, ensureEnrolled } = require('../middleware/auth');

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.post('/:courseId/enroll', ensureAuthenticated, courseController.enrollCourse);
router.get('/:courseId/lessons/:lessonId', ensureAuthenticated, ensureEnrolled, lessonController.getLesson);

module.exports = router;