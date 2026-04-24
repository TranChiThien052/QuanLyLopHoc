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

const findByClassId = async (req, res) => {
    const { malop } = req.params;
    try {
        const diemDanh = await diemDanhService.findByClassId(malop);
        if (!diemDanh) {
            return res.status(404).json({ error: 'Điểm danh không tồn tại' });
        }
        res.json(diemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const findByClassAndSinhVienId = async (req, res) => {
    const { malop, maSinhVien } = req.params;
    try {
        const diemDanh = await diemDanhService.findByClassAndSinhVienId(malop, maSinhVien);
        if (!diemDanh) {
            return res.status(404).json({ error: 'Điểm danh không tồn tại' });
        }
        res.json(diemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    const { maSinhVien, maBuoiHoc, trangThai, ghiChu, maNguoiCapNhat, GPS } = req.body;
    const thoiGianCapNhat = new Date();
    try {
        const newDiemDanh = await diemDanhService.create(
            maSinhVien,
            maBuoiHoc,
            trangThai,
            ghiChu,
            thoiGianCapNhat,
            maNguoiCapNhat,
            GPS
        );
        res.status(201).json(newDiemDanh);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    const { maDiemDanh } = req.params;
    console.log("===> PAYLOAD RECEIVED:", req.body); // Check payload
    // Hỗ trợ nhận cả gps (chữ thường) lẫn GPS (chữ hoa)
    const receivedGPS = req.body.gps !== undefined ? req.body.gps : req.body.GPS;
    const finalGPS = receivedGPS ? String(receivedGPS) : null;
    console.log("===> FINAL GPS EXTRACTED:", finalGPS); // Check derived value

    const { trangThai, ghiChu, maNguoiCapNhat } = req.body;
    const thoiGianCapNhat = new Date();
    try {
        const updatedDiemDanh = await diemDanhService.update(
            maDiemDanh,
            trangThai,
            ghiChu || null,
            thoiGianCapNhat,
            maNguoiCapNhat,
            finalGPS
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

const diemDanhThuCong = async (req, res) => {
    const maNguoiCapNhat = req.user.id
    const {maBuoiHoc,danhSachDiemDanh} = req.body
    try{
        const diemDanh =await diemDanhService.diemDanhThuCong(maNguoiCapNhat,maBuoiHoc,danhSachDiemDanh)
        return res.status(200).json(diemDanh);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    findAll,
    findBySinhVienId,
    findByBuoiHocId,
    findByClassId,
    findByClassAndSinhVienId,
    create,
    update,
    deleteDiemDanh,
    diemDanhThuCong
};
