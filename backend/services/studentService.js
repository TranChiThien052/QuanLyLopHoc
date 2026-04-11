const studentRepository = require("../repositories/studentRepository");

const getAll = async () => {
  return await studentRepository.findAll();
};

const getStudentById = async (masinhvien) => {
    return await studentRepository.findByMaSinhVien(masinhvien);
};
  
const createStudent = async (masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop) => {
    if (!masinhvien) 
        throw new Error("Thiếu mã sinh viên");

    if(masinhvien.indexOf(" ") !== -1 || ten.indexOf(" ") !== -1)
        throw new Error("Mã và tên không chứa khoảng trắng !");

    if( !ten || !holot || !email || !malop)
        throw new Error("Thiếu thông tin email, họ tên, mã lớp sinh viên!");

    return await studentRepository.create(masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop);
};

const deleteStudentById = async (masinhvien) => {
    if(!masinhvien)
        throw new Error("Vui long nhap ma !");

    return await studentRepository.destroy(masinhvien);
}

const updateInfoStudent = async (masinhvien,ten,holot,ngaysinh,email,sodienthoai) => {
    if(!masinhvien)
        throw new Error("Vui long truyen ma !");

    if(ten.indexOf(" ") !== -1)
        throw new Error("Mã và tên không chứa khoảng trắng !");

    if(!holot || !ten || !email || !sodienthoai || !ngaysinh)
        throw new Error("Thieu thong tin dau vao !")
    return await studentRepository.update(masinhvien, ten, holot, ngaysinh, email, sodienthoai);
}

module.exports = { getAll, getStudentById, createStudent, deleteStudentById, updateInfoStudent};