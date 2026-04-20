const { class : Class, SinhVien } = require('../models');

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
    const sinhVien = await SinhVien.findOne({
        where: { masinhvien: id },
        attributes: [], // Không lấy các trường của SinhVien 
        include: [{
            model: Class,
            attributes: ['malop', 'monhoc','ngayhoccodinh','ngaybatdau','ngayketthuc','giobatdau','gioketthuc'],
            through: {
                attributes: [] // Loại bỏ các trường trung gian của bảng lop_sinhvien khỏi kết quả
            }
        }]
    });
    console.log(sinhVien)

    return sinhVien ? sinhVien.LopHocs : [];
};

const findMonHocCuaGiangVien = async (id) => {
    const monhoc = await Class.findAll(
        {
            where: { magiangvien : id }
        }
    );

    return monhoc
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
