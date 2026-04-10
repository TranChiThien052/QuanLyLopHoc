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

const create = async (TenLop, MonHoc , MaGiangVien) => {
    return await Class.create({
        TenLop,
        MonHoc,
        MaGiangVien
    });
};

const update = async (MaLop, TenLop, MonHoc, MaGiangVien) => {
    const lop = await Class.findOne(
        {
            where: {
                MaLop : MaLop
            }
        }
    );
    if (!lop) {
        throw new Error("Lớp học không tồn tại");
    }
    lop.TenLop = TenLop;
    lop.MonHoc = MonHoc;
    lop.MaGiangVien = MaGiangVien;
    return await lop.save();
}

const deleteClass = async (MaLop) => {
    const lop = await Class.findOne(
        {
            where: {
                MaLop : MaLop
            }
        }
    );
    if (!lop) {
        throw new Error("Lớp học không tồn tại");
    }
    return await lop.destroy();
}