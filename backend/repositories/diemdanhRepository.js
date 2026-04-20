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

const create = async (maSinhVien, maBuoiHoc, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat, GPS) => {
    const maDiemDanh = maSinhVien + "_" + maBuoiHoc;
    return await DiemDanh.create({
        madiemdanh: maDiemDanh,
        masinhvien: maSinhVien,
        mabuoihoc: maBuoiHoc,
        trangthai: trangThai,
        ghichu: ghiChu,
        thoigiancapnhat: thoiGianCapNhat,
        manguoicapnhat: maNguoiCapNhat,
        GPS: GPS,
    });
};

const initList = async (listSinhVien, listBuoiHoc) => {
    const createDiemDanh = [];
    for (const maBuoiHoc of listBuoiHoc) {
        const diemDanhObjects = listSinhVien.map(maSinhVien => {
            const maDiemDanh = maSinhVien + "_" + maBuoiHoc;
            return {
                madiemdanh: maDiemDanh,
                masinhvien: maSinhVien,
                mabuoihoc: maBuoiHoc,
                trangthai: 'vắng không phép',
                ghichu: '',
                thoigiancapnhat: new Date(),
                manguoicapnhat: 'system',
                GPS: null
            };
        });
        const createdDiemDanh = await DiemDanh.bulkCreate(diemDanhObjects, {
            ignoreDuplicates: true 
        });
        createDiemDanh.push(...createdDiemDanh);
    }
    return createDiemDanh;
}

const update = async (maDiemDanh, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat, GPS) => {
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
    diemdanh.GPS = GPS;
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

module.exports = {
    findAll,
    findBySinhVienId,
    findByBuoiHocId,
    create,
    initList,
    update,
    deleteDiemDanh
}