const lessonRepository = require('../repositories/lessonRepository');

const toDDMMYYYY = (ngayhoc) => {
    const [yyyy, mm, dd] = String(ngayhoc).split("-");
    if (!yyyy || !mm || !dd) {
        const err = new Error("ngayhoc không đúng định dạng YYYY-MM-DD");
        err.status = 400;
        throw err;
    }
    return `${dd}${mm}${yyyy}`;
};

const makeMaBuoiHoc = (malop, ngayhoc) => `${malop}_${toDDMMYYYY(ngayhoc)}`;

const getTodayDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const getAllLessons = async () => {
    return await lessonRepository.findAll();
}

const getLessonById = async (mabuoihoc) => {
    if (!mabuoihoc) {
        throw new Error("Thiếu id của buổi học");
    }
    return await lessonRepository.findByMaBuoiHoc(mabuoihoc);
}

const createLesson = async (malop, giobatdau, gioketthuc, noidungbuoihoc) => {
    if (!malop || !giobatdau || !gioketthuc) {
        const err = new Error("Thiếu thông tin để tạo buổi học");
        err.status = 400;
        throw err;
    }

    const ngayhoc = getTodayDate();
    const mabuoihoc = makeMaBuoiHoc(malop, ngayhoc);
    const existed = await lessonRepository.findByMaBuoiHoc(mabuoihoc);
    if (existed) {
        const err = new Error("Buổi học của lớp này trong ngày đã tồn tại");
        err.status = 409; // controller có thể dùng err.status
        throw err;
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