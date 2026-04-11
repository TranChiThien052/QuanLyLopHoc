const teacherRepository = require("../repositories/teacherRepository");

const getAll = async () => {
  return await teacherRepository.findAll();
};

const getTeacherById = async (magiangvien) => {
    return await teacherRepository.findByMaGiangVien(magiangvien);
};

const createTeacher = async (magiangvien,ten,holot,ngaysinh,email,sodienthoai) => {
    if (!magiangvien) 
        throw new Error("Thiếu mã giảng viên");

    if(magiangvien.indexOf(" ") !== -1 || ten.indexOf(" ") !== -1)
        throw new Error("Mã và tên không chứa khoảng trắng !");

    if( !ten || !holot || !email)
        throw new Error("Thiếu thông tin email và họ tên giảng viên!");

    return await teacherRepository.create(magiangvien,ten,holot,ngaysinh,email,sodienthoai);
};

const deleteTeacherById = async (magiangvien) => {
    if(!magiangvien)
        throw new Error("Vui long truyen ma !");

    return await teacherRepository.destroy(magiangvien);
}

const updateInfoTeacher = async (magiangvien,ten,holot,ngaysinh,email,sodienthoai) => {
    if(!magiangvien)
        throw new Error("Vui long truyen ma !");

    if(ten.indexOf(" ") !== -1)
        throw new Error("Tên không được chứa khoảng trắng !");

    if(!holot || !ten || !email || !sodienthoai)
        throw new Error("Thieu thong tin dau vao !");

    return await teacherRepository.update(magiangvien,ten,holot,ngaysinh,email,sodienthoai);
}

module.exports = { getAll, getTeacherById,  createTeacher, deleteTeacherById, updateInfoTeacher};