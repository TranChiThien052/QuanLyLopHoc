const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const authenController = require('../controllers/authController');

router.get("/", authenController.authenticate,authenController.authorize(['admin']),teacherController.getAll);
router.get("/info/teacher",authenController.authenticate,authenController.authorize(['admin','teacher']), teacherController.getTeacherById);
router.post("/",authenController.authenticate,authenController.authorize(['admin','teacher']), teacherController.createTeacher);
router.delete("/:magiangvien",authenController.authenticate,authenController.authorize('admin'), teacherController.deleteTeacherById);
router.put("/",authenController.authenticate,authenController.authorize(['teacher']), teacherController.updateInfoTeacher);
router.get("/ds/monhoc",authenController.authenticate,authenController.authorize(['teacher', 'admin']), teacherController.getMonHocCuaGiangVien);
module.exports = router;