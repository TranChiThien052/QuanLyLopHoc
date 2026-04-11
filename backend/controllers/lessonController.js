const lessonService = require('../services/lessonService');

const getAllLessons = async (req, res) => {
    try {
        const lessons = await lessonService.getAllLessons();
        return res.status(200).json(lessons);
    } catch (error) {
        return res.status(500).json({ code: 999, message: error.message });
    }
};

const getLessonById = async (req, res) => {
    try {
        const { mabuoihoc } = req.params;
        const lesson = await lessonService.getLessonById(mabuoihoc);
        if (!lesson) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy buổi học !" });
        }
        return res.status(200).json(lesson);
    } catch (error) {
        return res.status(500).json({ code: 999, message: error.message });
    }
};

const createLesson = async (req, res) => {
    try {
        const { mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc } = req.body;
        const lesson = await lessonService.createLesson(mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc);
        return res.status(200).json(lesson);
    } catch (error) {
        return res.status(500).json({ code: 999, message: error.message });
    }
};

const updateLesson = async (req, res) => {
    try {
        const { mabuoihoc } = req.params;
        const { malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc } = req.body;
        const lesson = await lessonService.updateLesson(mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc);
        return res.status(200).json(lesson);
    } catch (error) {
        return res.status(500).json({ code: 999, message: error.message });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const { mabuoihoc } = req.params;
        const deleted = await lessonService.deleteLesson(mabuoihoc);
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy buổi học !" });
        }
        return res.status(200).json({ message: `Đã xóa thành công buổi học ${mabuoihoc} !`, mabuoihoc });
    } catch (error) {
        return res.status(500).json({ code: 999, message: error.message });
    }
};

module.exports = {
    getAllLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
};