const lessonRepository = require('../repositories/lessonRepository');

const getAllLessons = async () => {
    return await lessonRepository.findAll();
}

const getLessonById = async (mabuoihoc) => {
    if (!mabuoihoc) {
        throw new Error("Thiếu id của buổi học");
    }
    return await lessonRepository.findByMaBuoiHoc(mabuoihoc);
}

const createLesson = async (mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc) => {
    if (!mabuoihoc || !malop || !ngayhoc || !giobatdau || !gioketthuc || !noidungbuoihoc) {
        throw new Error("Thiếu thông tin để tạo buổi học");
    }
    return await lessonRepository.create(mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc);
}

const updateLesson = async (mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc) => {
    if (!mabuoihoc || !malop || !ngayhoc || !giobatdau || !gioketthuc || !noidungbuoihoc) {
        throw new Error("Thiếu thông tin để cập nhật buổi học");
    }
    return await lessonRepository.update(mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc);
}

const deleteLesson = async (mabuoihoc) => {
    if (!mabuoihoc) {
        throw new Error("Thiếu id của buổi học");
    }
    return await lessonRepository.remove(mabuoihoc);
}

module.exports = {
    getAllLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
}