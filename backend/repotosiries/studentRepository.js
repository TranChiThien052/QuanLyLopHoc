const { student : SinhVien } = required('../models');

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

const update = async ( masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop) => {
    const student = await SinhVien.findOne({
        where: {
            masinhvien: masinhvien
        }});
    if (!student) return null;
    return await student.update({ masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop});
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

const create = async ( masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop,faceid) => {
    return await SinhVien.create({ masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop,faceid });
};


module.exports = { findAll, findByMaSinhVien, create, update, destroy };