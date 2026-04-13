const classService = require('../services/classService');
const teacherService = require('../services/teacherService');

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
    const { MonHoc, MaGiangVien } = req.body;
    const teacher = await teacherService.getTeacherById(MaGiangVien);
    if (!teacher) {
        return res.status(400).json({ error: 'Mã giảng viên không hợp lệ' });
    }
    const TenLop = MonHoc + '_' + teacher.holot + " " + teacher.ten;
    try {
        const newClass = await classService.create(TenLop, MonHoc, MaGiangVien);
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    const { MaLop } = req.params;
    const { MonHoc, MaGiangVien } = req.body;
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
        const updatedClass = await classService.update(MaLop, TenLop, MonHoc, MaGiangVien);
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