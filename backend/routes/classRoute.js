const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

router.get('/', classController.findAll);
router.get('/:id', classController.findById);
router.post('/', classController.create);
router.put('/:MaLop', classController.update);
router.delete('/:MaLop', classController.deleteClass);

module.exports = router;
