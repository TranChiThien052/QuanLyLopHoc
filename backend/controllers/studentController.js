const studentService = require("../services/studentService");

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
        const masinhvien = req.params.masinhvien
        const {faceid} = req.body
        const student = await studentService.updateFaceIdStudent(masinhvien,faceid);

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

module.exports = { getAll, getStudentById, createStudent, deleteStudentById, updateInfoStudent, updateFaceIdStudent };