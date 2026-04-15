const {  SinhVien } = require('../models');

const findAll = async () => {
    return await SinhVien.findAll();
};

const findByMaSinhVien = async (masinhvien) => {
    return await SinhVien.findOne({
        where: {
            masinhvien: masinhvien
        }
    });
};

const update = async ( masinhvien,ten,holot,ngaysinh,email,sodienthoai) => {
    const student = await SinhVien.findOne({
        where: {
            masinhvien: masinhvien
        }});
    if (!student) return null;
    return await student.update({ ten,holot,ngaysinh,email,sodienthoai});
};

const destroy = async (masinhvien) => {
  const student = await SinhVien.findOne({
    where: {
        masinhvien: masinhvien
    }
  });
  if (!student) return null;
  return await student.destroy();
};

const create = async ( masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop) => {
    return await SinhVien.create({ masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop });
};

const createBulk = async (listSinhVien) => {
    const sinhVienObjects = listSinhVien.map(sinhvien => {
        return {
            masinhvien: sinhvien.MaSinhVien,
            ten: sinhvien.Ten,
            holot: sinhvien.HoLot,
            ngaysinh: sinhvien.NgaySinh,
            email: sinhvien.Email,
            sodienthoai: sinhvien.SoDienThoai,
            malop: sinhvien.MaLop
        };
    });
    return await SinhVien.bulkCreate(sinhVienObjects, {
        ignoreDuplicates: true 
    });
}

const updateFaceId = async ( masinhvien,faceid) => {
    const student = await SinhVien.findOne({
        where: {
            masinhvien: masinhvien
        }});
    if (!student) return null;
    return await student.update({faceid});
};

module.exports = { findAll, findByMaSinhVien, create, createBulk, update, destroy, updateFaceId };