const lopsinhvienService = require('../services/lopsinhvienService');

const getAllLopSinhVien = async (req, res) => {
    try {
        const lopsinhvien = await lopsinhvienService.getAllLopSinhVien();
        res.status(200).json(lopsinhvien);
    } catch (error) {
        res.status(500).json(
            {
                code: 999,
                message: error.message
            }
        );
    }
};

const getLopSinhVienById = async (req, res) => {
    try {
        const malop = req.params.malop
        const lopsinhvien = await lopsinhvienService.getLopSinhVienById(malop);
        let response = {}
         if(!lopsinhvien) {
            response.code = 404,
            response.message = "Không tìm thấy lớp sinh viên !";
         }
         else{
            response = lopsinhvien
         }
         res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            {
                code: 999,
                message: error.message
            }
        );
    }
};

const getLopSinhVienByMaSinhVien = async (req, res) => {
    try {
        const masinhvien = req.params.masinhvien
        const lopsinhvien = await lopsinhvienService.getLopSinhVienByMaSinhVien(masinhvien);
        let response = {}
            if(!lopsinhvien) {
                response.code = 404,
                response.message = "Không tìm thấy lớp sinh viên !";
            }
            else{
                response = lopsinhvien
            }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            {
                code: 999,
                message: error.message
            }
        );
    }
};

const createLopSinhVien = async (req, res) => {
    try {
        const {malop, masinhvien} = req.body
        const lopsinhvien = await lopsinhvienService.createLopSinhVien(malop, masinhvien);
        res.status(200).json(lopsinhvien);
    } catch (error) {
        res.status(500).json(
            {
                code: 999,
                message: error.message
            }
        );
    }
};

const createLopSinhVienBulk = async (req, res) => {
    try {
        const {malop, listmasinhvien} = req.body
        const result = await lopsinhvienService.createLopSinhVienBulk(malop, listmasinhvien);
        res.status(200).json({
            code: 200,
            message: `Tạo lớp sinh viên thành công với mã lớp ${malop} và ${result.length} sinh viên.`,
            data: result
        });
        
    } catch (error) {
        res.status(500).json(
            {
                code: 999,
                message: error.message
            }
        );
    }
}

const updateLopSinhVien = async (req, res) => {
    try {
        const {malop, masinhvien} = req.body
        const lopsinhvien = await lopsinhvienService.updateLopSinhVien(malop, masinhvien);
        res.status(200).json(lopsinhvien);
    } catch (error) {
        res.status(500).json(
            {
                code: 999,
                message: error.message
            }
        );
    }
};

const deleteLopSinhVien = async (req, res) => {
    try {
        const {malop, masinhvien} = req.body
        const lopsinhvien = await lopsinhvienService.deleteLopSinhVien(malop, masinhvien);
        if(!lopsinhvien){
            return res.status(404).json({ code: 404, message: "Không tìm thấy lớp sinh viên !" });
        }
        res.status(200).json({ code: 200, message: "Xóa lớp sinh viên thành công !" });
    } catch (error) {
        res.status(500).json(
            {
                code: 999,
                message: error.message
            }
        );
    }
};

module.exports = {
    getAllLopSinhVien,
    getLopSinhVienById,
    getLopSinhVienByMaSinhVien,
    createLopSinhVien,
    createLopSinhVienBulk,
    updateLopSinhVien,
    deleteLopSinhVien
}