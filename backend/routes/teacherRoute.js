const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

router.get("/", teacherController.getAll);
router.get("/:magiangvien", teacherController.getTeacherById);
router.post("/", teacherController.createTeacher);
router.delete("/:magiangvien", teacherController.deleteTeacherById);
router.put("/:magiangvien", teacherController.updateInfoTeacher);
module.exports = router;