const diemDanhService = require('../services/diemDanhService');

const findAll = async (req, res) => {
    try {
        const diemDanh = await diemDanhService.findAll();
        res.json(diemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const findBySinhVienId = async (req, res) => {
    const { maSinhVien } = req.params;
    try {
        const diemDanh = await diemDanhService.findBySinhVienId(maSinhVien);
        if (!diemDanh) {
            return res.status(404).json({ error: 'Điểm danh không tồn tại' });
        }
        res.json(diemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const findByBuoiHocId = async (req, res) => {
    const { maBuoiHoc } = req.params;
    try {
        const diemDanh = await diemDanhService.findByBuoiHocId(maBuoiHoc);
        if (!diemDanh) {
            return res.status(404).json({ error: 'Điểm danh không tồn tại' });
        }
        res.json(diemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    const { maSinhVien, maBuoiHoc, trangThai, ghiChu, maNguoiCapNhat } = req.body;
    const thoiGianCapNhat = new Date();
    try {
        const newDiemDanh = await diemDanhService.create(
            maSinhVien,
            maBuoiHoc,
            trangThai,
            ghiChu,
            thoiGianCapNhat,
            maNguoiCapNhat
        );
        res.status(201).json(newDiemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    const { maDiemDanh } = req.params;
    const { trangThai, ghiChu, maNguoiCapNhat } = req.body;
    const thoiGianCapNhat = new Date();
    try {
        const updatedDiemDanh = await diemDanhService.update(
            maDiemDanh,
            trangThai,
            ghiChu,
            thoiGianCapNhat,
            maNguoiCapNhat
        );
        res.json(updatedDiemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteDiemDanh = async (req, res) => {
    const { maDiemDanh } = req.params;
    try {
        await diemDanhService.deleteDiemDanh(maDiemDanh);
        res.json({ message: 'Xóa điểm danh thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    findAll,
    findBySinhVienId,
    findByBuoiHocId,
    create,
    update,
    deleteDiemDanh
};