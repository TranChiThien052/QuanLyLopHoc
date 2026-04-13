const { class : Class } = require('../models');

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

const create = async (tenlop, monhoc , magiangvien) => {
    return await Class.create({
        tenlop,
        monhoc,
        magiangvien
    });
};

const update = async (MaLop, TenLop, MonHoc, MaGiangVien) => {
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

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteClass
}
