const diemDanhRepo = require('../repositories/diemdanhRepository');

const findAll = async () => {
    return await diemDanhRepo.findAll();
}

const findBySinhVienId = async (maSinhVien) => {
    if (!maSinhVien)
        throw new Error("Thiếu dữ liệu mã sinh viên");
    return await diemDanhRepo.findBySinhVienId(maSinhVien);
}

const findByBuoiHocId = async (maBuoiHoc) => {
    if (!maBuoiHoc)
        throw new Error("Thiếu dữ liệu mã buổi học");
    return await diemDanhRepo.findByBuoiHocId(maBuoiHoc);
}

const create = async (maSinhVien, maBuoiHoc, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat) => {
    if (!maSinhVien || !maBuoiHoc || !trangThai || !thoiGianCapNhat || !maNguoiCapNhat)
        throw new Error("Thiếu dữ liệu để tạo điểm danh");
    return await diemDanhRepo.create(maSinhVien, maBuoiHoc, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat);
}

const initList = async (listSinhVien, listBuoiHoc) => {
    if (!listSinhVien || !Array.isArray(listSinhVien) || listSinhVien.length === 0)
        throw new Error('Thiếu dữ liệu để tạo điểm danh hàng loạt');
    if (!listBuoiHoc || !Array.isArray(listBuoiHoc) || listBuoiHoc.length === 0)
        throw new Error('Thiếu dữ liệu để tạo điểm danh hàng loạt');
    return await diemDanhRepo.initList(listSinhVien, listBuoiHoc);
}

const update = async (maDiemDanh, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat) => {
    if (!maDiemDanh || !trangThai || !ghiChu || !thoiGianCapNhat || !maNguoiCapNhat)
        throw new Error("Thiếu dữ liệu để cập nhật điểm danh");
    return await diemDanhRepo.update(maDiemDanh, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat);
}

const deleteDiemDanh = async (maDiemDanh) => {
    if (!maDiemDanh)
        throw new Error("Thiếu dữ liệu mã điểm danh");
    return await diemDanhRepo.deleteDiemDanh(maDiemDanh);
}

module.exports = {
    findAll,
    findBySinhVienId,
    findByBuoiHocId,
    create,
    initList,
    update,
    deleteDiemDanh
}