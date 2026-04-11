const classRepo = require('../repositories/classRepository');

const findAll = async () => {
    return await classRepo.findAll();
}

const findById = async (id) => {
    if (!id)
        throw new Error("Thiếu dữ liệu mã lớp học");
    return await classRepo.findById(id);
}

const create = async (TenLop, MonHoc, MaGiangVien) => {
    if (!TenLop || !MonHoc || !MaGiangVien)
        throw new Error("Thiếu dữ liệu để tạo lớp học");
    return await classRepo.create(TenLop, MonHoc, MaGiangVien);
}

const update = async (MaLop, TenLop, MonHoc, MaGiangVien) => {
    if (!MaLop || !TenLop || !MonHoc || !MaGiangVien)
        throw new Error("Thiếu dữ liệu để cập nhật lớp học");
    return await classRepo.update(MaLop, TenLop, MonHoc, MaGiangVien);
}

const deleteClass = async (MaLop) => {
    if (!MaLop)
        throw new Error("Thiếu dữ liệu mã lớp học");
    return await classRepo.deleteClass(MaLop);
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteClass
}