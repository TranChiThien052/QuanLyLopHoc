const { teacher : GiangVien } = required("../models");

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


module.exports = { findAll, findByMaGiangVien, create };