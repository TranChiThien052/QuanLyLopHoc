const classService = require('../services/classService');
const teacherService = require('../services/teacherService');
const lopSinhVienService = require('../services/lopsinhvienService');
const XLSX = require('xlsx');

const pickValue = (row, keys) => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key];
        }
    }
    return undefined;
};

const normalizeClassInput = (row) => {
    return {
        MaSinhVien: pickValue(row, ["Mã sinh viên"])
    };
};

const findAll = async (req, res) => {
    try {
        const classes = await classService.findAll();
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const findById = async (req, res) => {
    const { id } = req.params;
    try {
        const lop = await classService.findById(id);
        if (!lop) {
            return res.status(404).json({ error: 'Lớp học không tồn tại' });
        }
        res.json(lop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const listSinhVien = [];
        if (req.file) {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
                return res.status(400).json({ error: 'File Excel không có sheet dữ liệu' });
            }

            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            if (!rows.length) {
                return res.status(400).json({ error: 'File Excel không có dữ liệu' });
            }

            for (let i = 0; i < rows.length; i++) {
                const parsed = normalizeClassInput(rows[i]);
                const MaSinhVien = parsed.MaSinhVien;

                if (!MaSinhVien) {
                    return res.status(400).json({
                        error: `Dữ liệu thiếu ở dòng ${i + 2}. Vui lòng kiểm tra các cột bắt buộc trong file Excel`
                    });
                }
                listSinhVien.push(MaSinhVien);
            }
        }

        const { MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien } = req.body;
        
        const teacher = await teacherService.getTeacherById(MaGiangVien);
        if (!teacher) {
            return res.status(400).json({ error: 'Mã giảng viên không hợp lệ' });
        }

        const TenLop = MonHoc + '_' + teacher.holot + ' ' + teacher.ten;
        const newClass = await classService.create(TenLop, MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien);

        const danhSachLop = {
            malop: newClass.MaLop,
            listmasinhvien: listSinhVien
        }

        const createStudentList = await lopSinhVienService.create(danhSachLop);

        

        const response = {
            class: newClass,
            studentList: createStudentList
        }

        return res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    const { MaLop } = req.params;
    const { MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien } = req.body;
    const lop = await classService.findById(MaLop);
    if (!lop) {
        return res.status(404).json({ error: 'Lớp học không tồn tại' });
    }
    const teacher = await teacherService.getTeacherById(MaGiangVien);
    if (!teacher) {
        return res.status(400).json({ error: 'Mã giảng viên không hợp lệ' });
    }
    const TenLop = MonHoc + "_" + teacher.holot + " " + teacher.ten;
    try {
        const updatedClass = await classService.update(MaLop, TenLop, MonHoc, NgayBatDau, NgayKetThuc, NgayHocCoDinh, GioBatDau, GioKetThuc, MaGiangVien);
        res.json(updatedClass);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteClass = async (req, res) => {
    const { MaLop } = req.params;
    try {
        await classService.deleteClass(MaLop);
        res.json({ message: 'Xóa lớp học thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteClass
};