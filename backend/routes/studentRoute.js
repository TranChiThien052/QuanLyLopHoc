const express = require("express");
const router = express.Router();
const multer = require('multer');
const studentController = require("../controllers/studentController");

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

router.get("/", studentController.getAll);
router.get("/:masinhvien", studentController.getStudentById);
router.post("/", studentController.createStudent);
router.post("/bulk", (req, res, next) => {
	upload.single('excelFile')(req, res, (err) => {
		if (err) {
			return res.status(400).json({ error: err.message });
		}
		next();
	});
}, studentController.createBulkStudents);
router.delete("/:masinhvien", studentController.deleteStudentById);
router.put("/:masinhvien", studentController.updateInfoStudent);
router.put('/update-faceid/:masinhvien',studentController.updateFaceIdStudent);
module.exports = router;