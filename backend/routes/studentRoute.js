const express = require("express");
const router = express.Router();
const multer = require('multer');
const studentController = require("../controllers/studentController");
const authenController = require('../controllers/authController');
const studentFaceImageUpload = require('../middlewares/studentFaceImageUpload');

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

router.get("/",authenController.authenticate,authenController.authorize(['admin']),studentController.getAll);
router.get("/info/student",authenController.authenticate,authenController.authorize(['student']),studentController.getInfoStudentById);
router.get('/monhoc',authenController.authenticate,authenController.authorize(['student']),studentController.getMonHocCuaSinhVien);
router.get("/:masinhvien",authenController.authenticate,authenController.authorize(['admin','teacher']),studentController.getStudentById);
router.post("/", studentController.createStudent);
router.post("/bulk", authenController.authenticate, authenController.authorize(['admin']), (req, res, next) => {
	upload.single('excelFile')(req, res, (err) => {
		if (err) {
			return res.status(400).json({ error: err.message });
		}
		next();
	});
}, studentController.createBulkStudents);
router.delete("/:masinhvien",authenController.authenticate,authenController.authorize(['admin','teacher']),studentController.deleteStudentById);
router.put("/", authenController.authenticate,authenController.authorize(['student']),studentController.updateInfoStudent);
router.put("/update/:masinhvien", authenController.authenticate,authenController.authorize(['admin','teacher']),studentController.updateInfoStudentByAdmin);
router.put('/update-faceid',authenController.authenticate,authenController.authorize(['student']), (req, res, next) => {
    studentFaceImageUpload.single('faceImage')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, studentController.updateFaceIdStudent);
router.put('/reset-faceid/:masinhvien',authenController.authenticate,authenController.authorize(['admin']),studentController.resetFaceIdStudent);
router.get('/ds/monhoc',authenController.authenticate,authenController.authorize(['student']),studentController.getMonHocCuaSinhVien);
module.exports = router;