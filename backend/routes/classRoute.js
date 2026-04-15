const express = require('express');
const router = express.Router();
const multer = require('multer');
const classController = require('../controllers/classController');

const upload = multer({
	storage: multer.memoryStorage(),
	fileFilter: (req, file, cb) => {
		const isExcelMime = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel'
		].includes(file.mimetype);
		const isExcelExt = /\.(xlsx|xls)$/i.test(file.originalname);

		if (isExcelMime || isExcelExt) {
			return cb(null, true);
		}
		return cb(new Error('Chỉ hỗ trợ file Excel .xlsx hoặc .xls'));
	}
});

router.get('/', classController.findAll);
router.get('/:id', classController.findById);
router.post('/', (req, res, next) => {
	upload.single('excelFile')(req, res, (err) => {
		if (err) {
			return res.status(400).json({ error: err.message });
		}
		next();
	});
}, classController.create);
router.put('/:MaLop', classController.update);
router.delete('/:MaLop', classController.deleteClass);

module.exports = router;