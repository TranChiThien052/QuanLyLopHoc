const studentRepository = require("../repositories/studentRepository");
const accountRepository  = require("../repositories/accountRepository");
const classRepository = require("../repositories/classRepository");
const lopSinhVienRepository = require("../repositories/lopsinhvienRepository");

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

const createBulk = async (listSinhVien) => {
    if (!listSinhVien || !Array.isArray(listSinhVien) || listSinhVien.length === 0) {
        throw new Error('Thiếu dữ liệu để tạo sinh viên hàng loạt');
    }
    return await studentRepository.createBulk(listSinhVien);
};

const deleteStudentById = async (masinhvien) => {
    if(!masinhvien)
        throw new Error("Vui lòng truyền mã !");
    let studentDelete = await studentRepository.destroy(masinhvien);

    if(!studentDelete)
        throw new Error("Không tìm thấy sinh viên !")

    await accountRepository.deleteAccount(masinhvien);

    return studentDelete;
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

const updateFaceIdStudent = async (masinhvien,faceid) => {
    if(!Array.isArray(faceid) || !faceid)
        throw new Error("Sai faceId, vui lòng thử lại sau !");

    let student = await studentRepository.updateFaceId(masinhvien,faceid);
    if(!student)
        throw new Error("Không tìm thấy sinh viên !")

    return student
}

const monHocCuaSinhVien = async (idSinhVien) => {
    if(!idSinhVien)
        throw new Error("Chưa truyền mã sinh viên !")
    const monhoc = await lopSinhVienRepository.findByMaSinhVien(idSinhVien);
        
    return monhoc.length === 0 ? null : monhoc
}

module.exports = { getAll, getStudentById, createStudent, createBulk, deleteStudentById, updateInfoStudent,updateFaceIdStudent,monHocCuaSinhVien};