const express = require('express');
const router = express.Router();
const diemDanhController = require('../controllers/diemDanhController');
const authenController = require('../controllers/authController');
const { route } = require('./classRoute');

router.get('/', diemDanhController.findAll);
router.get('/sinhvien/:maSinhVien', diemDanhController.findBySinhVienId);
router.get('/buoihoc/:maBuoiHoc', diemDanhController.findByBuoiHocId);
router.get('/class/:malop', diemDanhController.findByClassId);
router.get('/classAndSinhVien/:malop/:maSinhVien', diemDanhController.findByClassAndSinhVienId);
router.post('/', diemDanhController.create);
router.put('/:maDiemDanh', diemDanhController.update);
router.delete('/:maDiemDanh', diemDanhController.deleteDiemDanh);
router.post('/thu-cong',authenController.authenticate,authenController.authorize(['teacher']),diemDanhController.diemDanhThuCong);

module.exports = router;