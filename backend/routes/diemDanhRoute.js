const express = require('express');
const router = express.Router();
const diemDanhController = require('../controllers/diemDanhController');

router.get('/', diemDanhController.findAll);
router.get('/sinhvien/:maSinhVien', diemDanhController.findBySinhVienId);
router.get('/buoihoc/:maBuoiHoc', diemDanhController.findByBuoiHocId);
router.post('/', diemDanhController.create);
router.put('/:maDiemDanh', diemDanhController.update);
router.delete('/:maDiemDanh', diemDanhController.deleteDiemDanh);
router.post('/thu-cong',diemDanhController.diemDanhThuCong);

module.exports = router;