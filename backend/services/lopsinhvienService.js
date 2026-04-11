const lopsinhvienRepository = require('../repositories/lopsinhvienRepository');

const getAllLopSinhVien = async () => {
    return await lopsinhvienRepository.findAll();
}

const getLopSinhVienById = async (malop) => {
    if (!malop) {
        throw new Error("Thiếu id của lớp sinh viên");
    }
    return await lopsinhvienRepository.findById(malop);
}

const createLopSinhVien = async(malop, masinhvien) => {
    if (!malop || !masinhvien) {
        throw new Error("Thiếu thông tin để tạo lớp sinh viên");
    }
    return await lopsinhvienRepository.create(malop, masinhvien);
}

const updateLopSinhVien = async (malop, masinhvien) => {
    if (!malop || !masinhvien) {
        throw new Error("Thiếu thông tin để cập nhật lớp sinh viên");
    }
    return await lopsinhvienRepository.update(malop, masinhvien);
}

const deleteLopSinhVien = async (malop, masinhvien) => {
    if (!malop || !masinhvien) {
        throw new Error("Thiếu thông tin để xóa lớp sinh viên");
    }
    return await lopsinhvienRepository.deleteLopSinhVien(malop, masinhvien);    
}

module.exports = {
    getAllLopSinhVien,
    getLopSinhVienById,
    createLopSinhVien,
    updateLopSinhVien,
    deleteLopSinhVien
}