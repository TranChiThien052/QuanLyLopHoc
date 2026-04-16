const express = require('express');
const route = express.Router();
const lessonController = require('../controllers/lessonController');

route.get('/', lessonController.getAllLessons);
route.get('/:mabuoihoc', lessonController.getLessonById);
route.get('/lop/:malop', lessonController.getLessonsByMaLop);
route.post('/', lessonController.createLesson);
route.post('/bulk', lessonController.createBulkLessons);
route.put('/:mabuoihoc', lessonController.updateLesson);
route.delete('/:mabuoihoc', lessonController.deleteLesson);
module.exports = route;