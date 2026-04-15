const teacherService = require("../services/teacherService");

const getAll = async (req, res) => {
    try {
        const teacher = await teacherService.getAll();
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
};

const getTeacherById = async (req, res) => {
    try {
        const magiangvien = req.params.magiangvien
        const teacher = await teacherService.getTeacherById(magiangvien);
        let response = {}

        if(!teacher) {
            response.code = 404,
            response.message = "Không tìm thấy giảng viên !";
        }
        else
            response = teacher
        
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

const createTeacher = async (req,res) => {
    try {
        const {magiangvien,ten,holot,ngaysinh,email,sodienthoai} = req.body
        const teacher = await teacherService.createTeacher(magiangvien,ten,holot,ngaysinh,email,sodienthoai);
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json(
            { 
                code:999,
                message: error.message 
            }
        );
    }
}

const deleteTeacherById = async (req,res) => {
    try {
        const magiangvien = req.params.magiangvien
        const teacher = await teacherService.deleteTeacherById(magiangvien);

        let response = {}
        if(!teacher) {
            response.code = 404,
            response.message = "Không tìm thấy giảng viên !";
        }
        else{
            response.message = `Đã xóa thành công ${magiangvien} !`;
            response.magiangvien = magiangvien
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

const updateInfoTeacher = async (req,res) => {
    try {
        const magiangvien = req.params.magiangvien
        const {ten,holot,ngaysinh,email,sodienthoai} = req.body
        const teacher = await teacherService.updateInfoTeacher(magiangvien,ten,holot,ngaysinh,email,sodienthoai);

        let response = {}
        if(!teacher) {
            response.code = 404,
            response.message = "Không tìm thấy giảng viên !";
        }
        else
            response = teacher

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


module.exports = { getAll, getTeacherById, createTeacher, deleteTeacherById, updateInfoTeacher };