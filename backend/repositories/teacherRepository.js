const {GiangVien, class: LopHoc, lesson: BuoiHoc, diemdanh: DiemDanh, lopsinhvien: Lop_SinhVien } = require("../models");

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

  // Lấy các lớp của giảng viên
  const cacLop = await LopHoc.findAll({ where: { magiangvien: magiangvien } });
  const danhSachMaLop = cacLop.map(lop => lop.malop);

  if (danhSachMaLop.length > 0) {
      // Tìm các buổi học của các lớp
      const cacBuoiHoc = await BuoiHoc.findAll({ where: { malop: danhSachMaLop } });
      const danhSachMaBuoiHoc = cacBuoiHoc.map(buoi => buoi.mabuoihoc);

      if (danhSachMaBuoiHoc.length > 0) {
          // Xóa điểm danh
          await DiemDanh.destroy({ where: { mabuoihoc: danhSachMaBuoiHoc } });
          // Xóa buổi học
          await BuoiHoc.destroy({ where: { mabuoihoc: danhSachMaBuoiHoc } });
      }

      // Xóa lớp sinh viên
      await Lop_SinhVien.destroy({ where: { malop: danhSachMaLop } });

      // Xóa lớp học
      await LopHoc.destroy({ where: { malop: danhSachMaLop } });
  }

  return await teacher.destroy();
};

module.exports = { findAll, findByMaGiangVien, create,update, destroy };