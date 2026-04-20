const classRepo = require('../repositories/classRepository');

const findAll = async () => {
    return await classRepo.findAll();
}

const findById = async (id) => {
    if (!id)
        throw new Error("Thiếu dữ liệu mã lớp học");
    return await classRepo.findById(id);
}

const create = async (TenLop, MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien) => {
    if (!TenLop || !MonHoc || !NgayBatDau || !NgayKetThuc || !NgayHocCoDinh || !GioBatDau || !GioKetThuc || !MaGiangVien)
        throw new Error("Thiếu dữ liệu để tạo lớp học");
    return await classRepo.create(TenLop, MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien);
}

const update = async (MaLop, TenLop, MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien) => {
    if (!MaLop || !TenLop || !MonHoc || !NgayBatDau || !NgayKetThuc || !NgayHocCoDinh || !GioBatDau || !GioKetThuc || !MaGiangVien)
        throw new Error("Thiếu dữ liệu để cập nhật lớp học");
    return await classRepo.update(MaLop, TenLop, MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien);
}

const deleteClass = async (MaLop) => {
    if (!MaLop)
        throw new Error("Thiếu dữ liệu mã lớp học");
    return await classRepo.deleteClass(MaLop);
}

const findMonHocCuaGiangVien = async (id) => {
    if (!id)
        throw new Error("Thiếu dữ liệu mã giảng viên");
    return await classRepo.findMonHocCuaGiangVien(id);
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteClass,
    findMonHocCuaGiangVien
}