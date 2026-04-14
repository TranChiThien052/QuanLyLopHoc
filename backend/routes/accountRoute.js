const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.findAll);
router.get('/sinhvien', accountController.findAllSinhVien);
router.get('/giangvien', accountController.findAllGiangVien);
router.get('/:username', accountController.findByUsername);
router.post('/', accountController.create);
router.put('/:username', accountController.update);
router.delete('/:username', accountController.deleteAccount);

module.exports = router;