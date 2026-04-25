const studentService = require("../services/studentService");
const accountService = require("../services/accountService");
const XLSX = require('xlsx');
const { uploadStudentFaceImage } = require('../config/cloudinary');

const pickValue = (row, keys) => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key];
        }
    }
    return undefined;
};

const normalizeStudentInput = (row) => {
    return {
        MaSinhVien: pickValue(row, ["Mã sinh viên"]),
        HoLot: pickValue(row, ["Họ lót"]),
        Ten: pickValue(row, ["Tên"]),
        NgaySinh: pickValue(row, ["Ngày sinh"]) || null,
        MaLop: pickValue(row, ["Mã lớp"]),
        Email: pickValue(row, ["Email"]),
        SoDienThoai: pickValue(row, ["ĐT liên lạc"]) || null,
    };
};

const getAll = async (req, res) => {
    try {
        const student = await studentService.getAll();
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
};

const getInfoStudentById = async (req, res) => {
    try {
        const masinhvien = req.user.id
        const student = await studentService.getStudentById(masinhvien);
        let response = {}

        if(!student) {
            response.code = 404,
            response.message = "Không tìm thấy sinh viên !";
        }
        else
            response = student
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
};

const getStudentById = async (req, res) => {
    try {
        const masinhvien = req.params.masinhvien
        const student = await studentService.getStudentById(masinhvien);
        let response = {}

        if(!student) {
            response.code = 404,
            response.message = "Không tìm thấy sinh viên !";
        }
        else
            response = student
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
};

const createStudent = async (req,res) => {
    try {
        const {masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop} = req.body
        const student = await studentService.createStudent(masinhvien,ten,holot,ngaysinh,email,sodienthoai,malop);
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
}

const createBulkStudents = async (req, res) => {
    try {
        const listSinhVien = [];
        if(req.file) {
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
                const parsed = normalizeStudentInput(rows[i]);
                const data = parsed;
                if (!data.MaSinhVien || !data.Ten || !data.HoLot || !data.MaLop) {
                    return res.status(400).json({ error: `Dòng ${i + 2} thiếu dữ liệu bắt buộc (Mã sinh viên, Họ lót, Tên, Mã lớp)` });
                }
                listSinhVien.push(data);
            }
            const result1 = await studentService.createBulk(listSinhVien);
            const result2 = await accountService.createBulk(listSinhVien);
            const result = {
                createdStudents: result1.length,
                createdAccounts: result2.length
            }
            res.status(200).json({
                code: 200,
                message: `Tạo lớp sinh viên thành công với ${result1.length} sinh viên.`,
                data: result
            });
        }
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message,
                detail: error.stack
            }
        );
    }
}

const deleteStudentById = async (req,res) => {
    try {
        const masinhvien = req.params.masinhvien
        const student = await studentService.deleteStudentById(masinhvien);
        let response = {}

        if(!student) {
            response.code = 404,
            response.message = "Không tìm thấy sinh viên !";
        }
        else{
            response.message = `Đã xóa thành công ${masinhvien} !`;
            response.masinhvien = masinhvien
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
}

const updateInfoStudent = async (req,res) => {
    try {
        const masinhvien = req.user.id
        const {ten,holot,ngaysinh,email,sodienthoai} = req.body
        const student = await studentService.updateInfoStudent(masinhvien,ten,holot,ngaysinh,email,sodienthoai);

        let response = {}
        if(!student) {
            response.code = 404,
            response.message = "Không tìm thấy sinh viên !";
        }
        else
            response = student

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
}

const updateInfoStudentByAdmin = async (req,res) => {
    try {
        const masinhvien = req.params.masinhvien
        const {ten,holot,ngaysinh,email,sodienthoai} = req.body
        const student = await studentService.updateInfoStudent(masinhvien,ten,holot,ngaysinh,email,sodienthoai);

        let response = {}
        if(!student) {
            response.code = 404,
            response.message = "Không tìm thấy sinh viên !";
        }
        else
            response = student

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
}

const updateFaceIdStudent = async (req,res) => {
    try {
        const masinhvien = req.user.id
        let { faceid } = req.body;

        if (typeof faceid === 'string') {
            try {
                faceid = JSON.parse(faceid);
            } catch (error) {
                throw new Error('FaceID khong dung dinh dang JSON');
            }
        }

        let imgUrl = null;
        if (req.file && req.file.buffer) {
            const uploadResult = await uploadStudentFaceImage(req.file.buffer, masinhvien);
            imgUrl = uploadResult.secure_url;
        }

        const student = await studentService.updateFaceIdStudent(masinhvien, faceid, imgUrl);

        console.log("FaceID sau khi cập nhật:", student.faceid);
        console.log("URL ảnh sau khi cập nhật:", student.img_url);

        let response = {}
        if(!student) {
            response.code = 404,
            response.message = "Không tìm thấy sinh viên !";
        }
        else
            response = student

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
}

const getMonHocCuaSinhVien =  async (req, res) => {
    try {
        const masinhvien = req.user.id
        const monhoc = await studentService.monHocCuaSinhVien(masinhvien)

        let response = {}
        if(!monhoc) {
            response.code = 404,
            response.message = "Không tìm thấy sinh viên !";
        }
        else
            response = monhoc

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
}

const resetFaceIdStudent = async (req,res) => {
    try {
        const { masinhvien } = req.params;
        if (!masinhvien || masinhvien.trim() === '') {
            return res.status(400).json({ code: 400, message: "Mã sinh viên không hợp lệ!" });
        }

        const student = await studentService.resetFaceIdStudent(masinhvien);

        let response = {};
        if (!student) {
            response.code = 404;
            response.message = "Không tìm thấy sinh viên !";
        } else {
            response = student;
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(
            { 
                code: 999,
                message: error.message 
            }
        );
    }
}

module.exports = { 
    getAll, 
    getStudentById, 
    createStudent, 
    createBulkStudents, 
    deleteStudentById, 
    updateInfoStudent, 
    updateFaceIdStudent,
    getMonHocCuaSinhVien,
    getInfoStudentById,
    updateInfoStudentByAdmin,
    resetFaceIdStudent
};