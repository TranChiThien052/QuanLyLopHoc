const { class : Class, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const lopsinhvienRepositories = require("./lopsinhvienRepository")

const findAll = async () => {
    return await Class.findAll();
};

const findById = async (id) => {
    return await Class.findOne(
        {
            where: { malop : id }
        }
    );
};

const create = async (tenlop, monhoc, ngaybatdau, ngayketthuc, ngayhoccodinh, giobatdau, gioketthuc, magiangvien) => {
    return await Class.create({
        tenlop,
        monhoc,
        ngaybatdau,
        ngayketthuc,
        ngayhoccodinh,
        giobatdau,
        gioketthuc,
        magiangvien
    });
};

const update = async (MaLop, TenLop, MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien) => {
    const lop = await Class.findOne(
        {
            where: {
                malop : MaLop
            }
        }
    );
    if (!lop) {
        throw new Error("Lớp học không tồn tại");
    }
    lop.tenlop = TenLop;
    lop.monhoc = MonHoc;
    lop.ngaybatdau = NgayBatDau;
    lop.ngayketthuc = NgayKetThuc;
    lop.ngayhoccodinh = NgayHocCoDinh;
    lop.giobatdau = GioBatDau;
    lop.gioketthuc = GioKetThuc;
    lop.magiangvien = MaGiangVien;
    return await lop.save();
}

const deleteClass = async (MaLop) => {
    const lop = await Class.findOne(
        {
            where: {
                malop : MaLop
            }
        }
    );
    if (!lop) {
        throw new Error("Lớp học không tồn tại");
    }
    return await lop.destroy();
}

const findMonHocCuaSinhVien = async (id) => {
    const rows = await sequelize.query(
        `SELECT 
            lh.malop, 
            lh.monhoc
        FROM 
            lophoc AS lh
        INNER JOIN 
            lop_sinhvien AS lsv ON lh.malop = lsv.malop
        WHERE 
            lsv.masinhvien = :maSinhVien`,
        {
            replacements: { maSinhVien: id },
            type: QueryTypes.SELECT
        }
    );
    return rows;
};

const findMonHocCuaGiangVien = async (id) => {
    const monhoc = await Class.findAll(
        {
            where: { magiangvien : id }
        }
    );

    let promiseArray = monhoc.map( async item => {
        let soLuong = await lopsinhvienRepositories.findSinhVienCuaLopHoc(item.malop)

        return {
            maLop: item.malop,
            tenLop: item.tenlop,
            tenMonHoc: item.monhoc,
            soLuongSinhVien: soLuong.length
        }
    })
    const response = await Promise.all(promiseArray);
    
    return response
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteClass,
    findMonHocCuaSinhVien,
    findMonHocCuaGiangVien
}
