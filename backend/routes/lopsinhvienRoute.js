const express = require('express');
const route = express.Router();
const lopsinhvienController = require('../controllers/lopsinhvienController');

route.get('/', lopsinhvienController.getAllLopSinhVien);
route.get('/:malop', lopsinhvienController.getLopSinhVienById);
route.post('/', lopsinhvienController.createLopSinhVien);
route.put('/', lopsinhvienController.updateLopSinhVien);
route.post('/bulk', lopsinhvienController.createLopSinhVienBulk);
route.delete('/', lopsinhvienController.deleteLopSinhVien);
module.exports = route;