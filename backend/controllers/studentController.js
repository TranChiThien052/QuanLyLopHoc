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
        // ✅ CHECK 1: File có được upload không
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                error: 'Không có file Excel được upload',
                message: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)'
            });
        }

        const listSinhVien = [];
        
        // ✅ CHECK 2: File có hợp lệ không
        if (!req.file.buffer || req.file.buffer.length === 0) {
            return res.status(400).json({
                code: 400,
                error: 'File Excel rỗng hoặc không hợp lệ'
            });
        }

        // ✅ CHECK 3: Parse Excel file
        let workbook;
        try {
            workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        } catch (parseError) {
            return res.status(400).json({
                code: 400,
                error: 'Lỗi đọc file Excel: ' + parseError.message,
                message: 'File Excel có thể bị hỏng, vui lòng thử file khác'
            });
        }

        const sheetName = workbook.SheetNames[0];
        
        if (!sheetName) {
            return res.status(400).json({
                code: 400,
                error: 'File Excel không có sheet dữ liệu'
            });
        }

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        if (!rows.length) {
            return res.status(400).json({
                code: 400,
                error: 'File Excel không có dữ liệu sinh viên'
            });
        }

        // ✅ CHECK 4: Validate & normalize dữ liệu
        for (let i = 0; i < rows.length; i++) {
            const parsed = normalizeStudentInput(rows[i]);
            const data = parsed;
            
            if (!data.MaSinhVien || !data.Ten || !data.HoLot || !data.MaLop) {
                return res.status(400).json({
                    code: 400,
                    error: `Dòng ${i + 2} thiếu dữ liệu bắt buộc (Mã sinh viên, Họ lót, Tên, Mã lớp)`,
                    row: i + 2,
                    data: rows[i]
                });
            }

            // ✅ Validate email format
            if (data.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Email)) {
                return res.status(400).json({
                    code: 400,
                    error: `Dòng ${i + 2}: Email không hợp lệ "${data.Email}"`,
                    row: i + 2
                });
            }

            // ✅ Validate phone format (nếu có)
            if (data.SoDienThoai && !/^[0-9]{10}$/.test(data.SoDienThoai.toString())) {
                return res.status(400).json({
                    code: 400,
                    error: `Dòng ${i + 2}: Số điện thoại phải là 10 chữ số "${data.SoDienThoai}"`,
                    row: i + 2
                });
            }

            listSinhVien.push(data);
        }

        // ✅ CHECK 5: Tạo sinh viên
        let result1, result2;
        try {
            result1 = await studentService.createBulk(listSinhVien);
            console.log(`✅ Tạo ${result1.length} sinh viên`);
        } catch (serviceError) {
            console.error('❌ Lỗi tạo sinh viên:', serviceError.message);
            return res.status(500).json({
                code: 999,
                error: 'Lỗi tạo sinh viên: ' + serviceError.message,
                message: 'Kiểm tra lại dữ liệu (tên cột, định dạng email/sdt, mã lớp tồn tại)'
            });
        }

        // ✅ CHECK 6: Tạo tài khoản
        try {
            result2 = await accountService.createBulk(listSinhVien);
            console.log(`✅ Tạo ${result2.length} tài khoản`);
        } catch (serviceError) {
            console.error('❌ Lỗi tạo tài khoản:', serviceError.message);
            return res.status(500).json({
                code: 999,
                error: 'Lỗi tạo tài khoản: ' + serviceError.message,
                message: 'Có thể mã sinh viên đã tồn tại, vui lòng kiểm tra'
            });
        }
        
        const result = {
            createdStudents: result1.length,
            createdAccounts: result2.length,
            totalRequested: listSinhVien.length
        };
        
        console.log(`✅ Import hoàn thành: ${result1.length}/${listSinhVien.length} sinh viên`);
        
        res.status(200).json({
            code: 200,
            message: `Tạo sinh viên thành công: ${result1.length}/${listSinhVien.length} sinh viên được thêm (một số có thể bị bỏ qua nếu trùng).`,
            data: result
        });

    } catch (error) {
        console.error('❌ Lỗi createBulkStudents:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        // ✅ Handle database constraint error
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                code: 400,
                error: 'Dữ liệu bị trùng: ' + error.errors?.[0]?.message || error.message,
                message: 'Kiểm tra lại dữ liệu (email, số điện thoại, mã sinh viên có thể bị trùng)'
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                code: 400,
                error: 'Dữ liệu không hợp lệ: ' + error.errors?.[0]?.message || error.message,
                message: 'Kiểm tra lại định dạng dữ liệu (email, số điện thoại, ...)'
            });
        }

        // ✅ Generic server error
        res.status(500).json({
            code: 999,
            message: 'Lỗi xử lý file Excel',
            error: error.message,
            detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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