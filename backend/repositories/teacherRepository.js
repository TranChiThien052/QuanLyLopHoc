const {GiangVien } = require("../models");

const findAll = async () => {
    return await GiangVien.findAll();
};

const findByMaGiangVien = async (magiangvien) => {
    return await GiangVien.findOne({
        where: {
            magiangvien: magiangvien
        }
    });
};

const create = async ( magiangvien,ten,holot,ngaysinh,email,sodienthoai) => {
    return await GiangVien.create({ magiangvien,ten,holot,ngaysinh,email,sodienthoai});
};


const update = async ( magiangvien,ten,holot,ngaysinh,email,sodienthoai) => {
    const teacher = await GiangVien.findOne({
        where: {
            magiangvien: magiangvien
        }});
    if (!teacher) return null;
    return await teacher.update({ magiangvien,ten,holot,ngaysinh,email,sodienthoai});
};

const destroy = async (magiangvien) => {
  const teacher = await GiangVien.findOne({
    where: {
        magiangvien: magiangvien
    }
  });
  if (!teacher) return null;
  return await teacher.destroy();
};

module.exports = { findAll, findByMaGiangVien, create,update, destroy };