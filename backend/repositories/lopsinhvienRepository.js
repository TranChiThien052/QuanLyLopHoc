const {lopsinhvien : Lopsinhvien,sequelize} = require('../models');
const { QueryTypes } = require('sequelize');

const findAll = async () => {
    return await Lopsinhvien.findAll();
};

const findById = async (malop) => {
    return await Lopsinhvien.findAll(
        {
            where: { malop : malop }
        }
    );
}

const create = async (malop, masinhvien) => {
    return await Lopsinhvien.create({
        malop,
        masinhvien
    });
}

const bulkCreate = async (malop, listmasinhvien) => {
    const lopsinhvienObjects = listmasinhvien.map(masinhvien=> {
        return{
            malop: malop,
            masinhvien: masinhvien
        };
    });
    return await Lopsinhvien.bulkCreate(lopsinhvienObjects, {
        ignoreDuplicates: true 
    });
}

const update = async (malop, masinhvien) => {
    const lopsinhvien = await Lopsinhvien.findOne(
        {
            where: {
                malop : malop,
                masinhvien : masinhvien
            }
        }
    );
    if (!lopsinhvien) {
        throw new Error("Lớp sinh viên không tồn tại");
    }   
    lopsinhvien.malop = malop;
    lopsinhvien.masinhvien = masinhvien;
    return await lopsinhvien.save();
}

const deleteLopSinhVien = async (malop, masinhvien) => {
    const lopsinhvien = await Lopsinhvien.findOne(
        {
            where: {
                malop : malop,
                masinhvien : masinhvien
            }
        }
    );
    if (!lopsinhvien) {
        throw new Error("Lớp sinh viên không tồn tại");
    }
    return await lopsinhvien.destroy();
}

const findSinhVienCuaLopHoc = async (id) => {
    const rows = await sequelize.query(
        `SELECT 
            lsv.masinhvien
        FROM 
            lophoc AS lh
        INNER JOIN 
            lop_sinhvien AS lsv ON lh.malop = lsv.malop
        WHERE 
            lsv.malop = :maLop`,
        {
            replacements: { maLop: id },
            type: QueryTypes.SELECT
        }
    );
    return rows;
};

module.exports = {
    findAll,
    findById,
    create,
    bulkCreate,
    update,
    deleteLopSinhVien,
    findSinhVienCuaLopHoc
}