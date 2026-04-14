const studentRepository = require("../repositories/studentRepository");
const accountRepository  = require("../repositories/accountRepository");
const bcrypt = require('bcrypt');

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
    if(await studentRepository.findByMaSinhVien(masinhvien) !== null)
        throw new Error("Mã sinh viên đã tồn tại !");

    const hashedPassword = await bcrypt.hash(masinhvien, Number(process.env.SALT_ROUNDS));
    let sinhvien = await studentRepository.create(masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop);
    let account = await accountRepository.create(masinhvien, masinhvien, hashedPassword, 'student');

    if(account === null){
        await studentRepository.deleteStudentById(masinhvien);
        throw new Error("Không thể tạo tạo sinh viên mói, vui lòng thử lại sau !");
    }
    return sinhvien
};

const deleteStudentById = async (masinhvien) => {
    if(!masinhvien)
        throw new Error("Vui lòng truyền mã !");
    let studentDelete = await studentRepository.destroy(masinhvien);

    if(!studentDelete)
        throw new Error("Không tìm thấy sinh viên !")

    await accountRepository.deleteAccount(masinhvien);

    return studentDelete
}

const updateInfoStudent = async (masinhvien,ten,holot,ngaysinh,email,sodienthoai) => {
    if(!masinhvien)
        throw new Error("Vui lòng truyền mã !");

    if(ten.indexOf(" ") !== -1)
        throw new Error("Mã và tên không chứa khoảng trắng !");

    if(!holot || !ten || !email || !sodienthoai || !ngaysinh)
        throw new Error("Thiếu thông tin đầu vào !")
    return await studentRepository.update(masinhvien, ten, holot, ngaysinh, email, sodienthoai);
}

module.exports = { getAll, getStudentById, createStudent, deleteStudentById, updateInfoStudent};