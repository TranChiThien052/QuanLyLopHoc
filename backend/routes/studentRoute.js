const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/", studentController.getAll);
router.get("/:masinhvien", studentController.getStudentById);
router.post("/", studentController.createStudent);
router.delete("/:masinhvien", studentController.deleteStudentById);
router.put("/:masinhvien", studentController.updateInfoStudent);
router.put('/update-faceid/:masinhvien',studentController.updateFaceIdStudent);
module.exports = router;