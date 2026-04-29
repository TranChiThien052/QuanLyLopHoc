const { diemdanh : DiemDanh } = require("../models");
const { lesson : Lesson } = require("../models");
const { SinhVien } = require("../models");
const { class : Class } = require("../models");

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

const findByClassId = async (malop) => {
    return await DiemDanh.findAll(
        {
            include: [
                {
                    model: Lesson,
                    where: { malop : malop },
                    attributes: []
                }
            ]
        }
    );
};

const findByClassAndSinhVienId = async (malop, maSinhVien) => {
    try {
    const result = await DiemDanh.findAll({
      include: [
        {
          model: Lesson,
          where: { malop : malop },
          attributes: []
        },
        {
          model: SinhVien,
          where: { masinhvien : maSinhVien },
          attributes: []
        }
      ]
    });

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const create = async (maSinhVien, maBuoiHoc, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat, GPS, imgUrl = null) => {
    const maDiemDanh = maSinhVien + "_" + maBuoiHoc;
    return await DiemDanh.create({
        madiemdanh: maDiemDanh,
        masinhvien: maSinhVien,
        mabuoihoc: maBuoiHoc,
        trangthai: trangThai,
        ghichu: ghiChu,
        thoigiancapnhat: thoiGianCapNhat,
        manguoicapnhat: maNguoiCapNhat,
        gps: GPS,
        img_url: imgUrl,
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
                trangthai: 'Lựa chọn',
                ghichu: '',
                thoigiancapnhat: new Date(),
                manguoicapnhat: 'system',
                gps: null,
                img_url: null
            };
        });
        const createdDiemDanh = await DiemDanh.bulkCreate(diemDanhObjects, {
            ignoreDuplicates: true 
        });
        createDiemDanh.push(...createdDiemDanh);
    }
    return createDiemDanh;
}

const update = async (maDiemDanh, trangThai, ghiChu, thoiGianCapNhat, maNguoiCapNhat, GPS, anhDiemDanhUrl) => {
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

    const finalGhiChu = ghiChu !== undefined ? ghiChu : diemdanh.ghichu;
    const finalImgUrl = anhDiemDanhUrl !== null && anhDiemDanhUrl !== undefined
        ? anhDiemDanhUrl
        : diemdanh.img_url;

    return await diemdanh.update({
        trangthai: trangThai,
        ghichu: finalGhiChu,
        thoigiancapnhat: thoiGianCapNhat,
        manguoicapnhat: maNguoiCapNhat,
        gps: GPS,
        img_url: finalImgUrl
    });
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
            manguoicapnhat: diemDanh.maNguoiCapNhat,
            gps: diemDanh.gps,
            img_url: diemDanh.imgUrl || null
        };
    });
    return await DiemDanh.bulkCreate(diemDanhObjects, {
        updateOnDuplicate: [
            'trangthai', 
            'ghichu', 
            'thoigiancapnhat', 
            'manguoicapnhat',
            'gps',
            'img_url'
        ]
    });
}

// trả về số dòng xóa, k bắt lỗi
const xoaSinhVienKhoiLopHoc = async (masinhvien) => {
    return await DiemDanh.destroy({
        where: {
            masinhvien: masinhvien
        }
    });
}

module.exports = {
    findAll,
    findBySinhVienId,
    findByBuoiHocId,
    findByClassId,
    findByClassAndSinhVienId,
    create,
    initList,
    update,
    deleteDiemDanh,
    createBulk,
    xoaSinhVienKhoiLopHoc
}
