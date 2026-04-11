const { diemdanh : DiemDanh } = require("../models");

const findAll = async () => {
    return await DiemDanh.findAll();
};

const findBySinhVienId = async (maSinhVien) => {
    return await DiemDanh.findOne(
        {
            where: { masinhvien : maSinhVien }
        }
    );
};

const findByBuoiHocId = async (maBuoiHoc) => {
    return await DiemDanh.findOne(
        {
            where: { mabuoihoc : maBuoiHoc }
        }
    );
};

const create = async (maSinhVien, maBuoiHoc, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat) => {
    const maDiemDanh = masinhvien + "_" + maBuoiHoc;
    return await DiemDanh.create({
        maDiemDanh,
        maSinhVien,
        maBuoiHoc,
        trangThai,
        ghiChu,
        thoiGianCapNhat,
        maNguoiCapNhat
    });
};

const update = async (maDiemDanh, maSinhVien, maBuoiHoc, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat) => {
    const diemdanh = await DiemDanh.findOne(
        {
            where: 
            {
                maDiemDanh : maDiemDanh 
            }
        }
    );
    if (!diemdanh) {
        throw new Error("Điểm danh không tồn tại");
    }
    diemdanh.trangThai = trangThai;
    diemdanh.ghiChu = ghiChu;
    diemdanh.thoiGianCapNhat = thoiGianCapNhat;
    diemdanh.maNguoiCapNhat = maNguoiCapNhat;
    return await diemdanh.save();
}

const deleteDiemDanh = async (maDiemDanh) => {
    const diemdanh = await DiemDanh.findOne(
        {
            where:
            {
                maDiemDanh : maDiemDanh
            }
        }
    );
    if (!diemdanh) {
        throw new Error("Điểm danh không tồn tại");
    }
    return await diemdanh.destroy();
}

module.exports = {
    findAll,
    findBySinhVienId,
    findByBuoiHocId,
    create,
    update,
    deleteDiemDanh
}