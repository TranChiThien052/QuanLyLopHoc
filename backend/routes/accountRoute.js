const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authController = require('../controllers/authController');

router.get('/', accountController.findAll);
router.get('/sinhvien',authController.authenticate,authController.authorize(['admin']),accountController.findAllSinhVien);
router.get('/giangvien',authController.authenticate,authController.authorize(['admin']), accountController.findAllGiangVien);
router.get('/:username', accountController.findByUsername);
router.post('/', accountController.create);
router.put('/:username', accountController.update);
router.delete('/:username', accountController.deleteAccount);

module.exports = router;