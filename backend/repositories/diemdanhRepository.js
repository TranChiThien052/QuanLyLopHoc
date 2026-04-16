const { diemdanh : DiemDanh } = require("../models");

const findAll = async () => {
    return await DiemDanh.findAll();
};

const findBySinhVienId = async (maSinhVien) => {
    return await DiemDanh.findAll(
        {
            where: { masinhvien : maSinhVien }
        }
    );
};

const findByBuoiHocId = async (maBuoiHoc) => {
    return await DiemDanh.findAll(
        {
            where: { mabuoihoc : maBuoiHoc }
        }
    );
};

const create = async (maSinhVien, maBuoiHoc, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat) => {
    const maDiemDanh = maSinhVien + "_" + maBuoiHoc;
    return await DiemDanh.create({
        madiemdanh: maDiemDanh,
        masinhvien: maSinhVien,
        mabuoihoc: maBuoiHoc,
        trangthai: trangThai,
        ghichu: ghiChu,
        thoigiancapnhat: thoiGianCapNhat,
        manguoicapnhat: maNguoiCapNhat
    });
};

const update = async (maDiemDanh, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat) => {
    const diemdanh = await DiemDanh.findOne(
        {
            where: 
            {
                madiemdanh : maDiemDanh 
            }
        }
    );
    if (!diemdanh) {
        throw new Error("Điểm danh không tồn tại");
    }
    diemdanh.trangthai = trangThai;
    diemdanh.ghichu = ghiChu;
    diemdanh.thoigiancapnhat = thoiGianCapNhat;
    diemdanh.manguoicapnhat = maNguoiCapNhat;
    return await diemdanh.save();
}

const deleteDiemDanh = async (maDiemDanh) => {
    const diemdanh = await DiemDanh.findOne(
        {
            where:
            {
                madiemdanh : maDiemDanh
            }
        }
    );
    if (!diemdanh) {
        throw new Error("Điểm danh không tồn tại");
    }
    return await diemdanh.destroy();
}

const createBulk = async (listDiemDanh) => {
    const diemDanhObjects = listDiemDanh.map(diemDanh => {
        return {
            madiemdanh: diemDanh.maDiemDanh,
            masinhvien: diemDanh.maSinhVien,
            mabuoihoc: diemDanh.maBuoiHoc,
            trangthai: diemDanh.trangThai,
            ghichu: diemDanh.ghiChu,
            thoigiancapnhat: diemDanh.thoiGianCapNhat,
            manguoicapnhat: diemDanh.maNguoiCapNhat
        };
    });
    return await DiemDanh.bulkCreate(diemDanhObjects, {
        updateOnDuplicate: [
            'trangthai', 
            'ghichu', 
            'thoigiancapnhat', 
            'manguoicapnhat'
        ]
    });
}

module.exports = {
    findAll,
    findBySinhVienId,
    findByBuoiHocId,
    create,
    update,
    deleteDiemDanh,
    createBulk
}