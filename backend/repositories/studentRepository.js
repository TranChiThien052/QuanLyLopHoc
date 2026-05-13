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

const resetFaceId = async (masinhvien) => {
    const student = await SinhVien.findOne({
        where: { masinhvien }
    });
    if (!student) return null;
    return await student.update({ faceid: null, img_url: null });
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
    
    try {
        // ✅ Thử tạo với ignoreDuplicates
        const result = await SinhVien.bulkCreate(sinhVienObjects, {
            ignoreDuplicates: true,
            validate: true
        });
        return result;
    } catch (error) {
        // ✅ Nếu lỗi constraint, tạo từng cái một
        console.warn('⚠️  bulkCreate fail, trying individual create:', error.message);
        const results = [];
        
        for (const obj of sinhVienObjects) {
            try {
                const created = await SinhVien.create(obj);
                results.push(created);
            } catch (e) {
                // ✅ Log lỗi nhưng tiếp tục
                console.warn(`⚠️  Lỗi tạo sinh viên ${obj.masinhvien}:`, e.message);
                // Không throw, chỉ skip record này
            }
        }
        return results;
    }
};

const updateFaceId = async ( masinhvien,faceid,imgUrl) => {
    const student = await SinhVien.findOne({
        where: {
            masinhvien: masinhvien
        }});
    if (!student) return null;
    const finalImgUrl = imgUrl !== undefined && imgUrl !== null ? imgUrl : student.img_url;
    return await student.update({faceid, img_url: finalImgUrl});
};

module.exports = { findAll, findByMaSinhVien, create, createBulk, update, destroy, updateFaceId, resetFaceId };