const teacherRepository = require("../repositories/teacherRepository");
const accountRepository  = require("../repositories/accountRepository");
const classRepository  = require("../repositories/classRepository");
const bcrypt = require('bcrypt');

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

    if(await teacherRepository.findByMaGiangVien(magiangvien) !== null)
        throw new Error("Mã giảng viên đã tồn tại !");

    const hashedPassword = await bcrypt.hash(magiangvien, Number(process.env.SALT_ROUNDS));
    let giangvien = await await teacherRepository.create(magiangvien,ten,holot,ngaysinh,email,sodienthoai);
    let account = await accountRepository.create(magiangvien, magiangvien, hashedPassword, 'teacher');

    if(account === null){
        await teacherRepository.deleteStudentById(magiangvien);
        throw new Error("Không thể tạo tạo giảng viên mói, vui lòng thử lại sau !");
    }
    return giangvien

};

const deleteTeacherById = async (magiangvien) => {
    if(!magiangvien)
        throw new Error("Vui lòng truyền mã !");
    let teacherDelete = await teacherRepository.destroy(magiangvien);

    if(!teacherDelete)
        throw new Error("Không tìm thấy giảng viên !")

    await accountRepository.deleteAccount(magiangvien);

    return teacherDelete
}

const updateInfoTeacher = async (magiangvien,ten,holot,ngaysinh,email,sodienthoai) => {
    if(!magiangvien)
        throw new Error("Vui lòng truyền mã !");

    if(ten.indexOf(" ") !== -1)
        throw new Error("Tên không được chứa khoảng trắng !");

    if(!holot || !ten || !email || !sodienthoai)
        throw new Error("Thiếu thông tin đầu vào !");

    return await teacherRepository.update(magiangvien,ten,holot,ngaysinh,email,sodienthoai);
}

const monHocCuaGiangVien = async (idGiangVien) => {
    if(!idGiangVien)
        throw new Error("Chưa truyền mã giảng viên !")
    const monhoc = await classRepository.findMonHocCuaGiangVien(idGiangVien);
        
    return monhoc.length === 0 ? null : monhoc
}

module.exports = { getAll, getTeacherById,  createTeacher, deleteTeacherById, updateInfoTeacher,monHocCuaGiangVien};