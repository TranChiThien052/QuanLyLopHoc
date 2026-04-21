const lessonRepository = require('../repositories/lessonRepository');
const lopsinhvienService = require('./lopsinhvienService');
const diemDanhService = require('./diemDanhService');

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

const getLessonsByMaLop = async (malop) =>{
    if(!malop){
        throw new Error("Thiếu mã lớp học");
    }
    return await lessonRepository.findByMaLop(malop);
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
    
    const newLesson = await lessonRepository.create(mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc);
    
    try {
        const danhSachSinhVien = await lopsinhvienService.getLopSinhVienById(malop);
        if (danhSachSinhVien && danhSachSinhVien.length > 0) {
            const listMaSinhVien = danhSachSinhVien.map(item => item.masinhvien);
            await diemDanhService.initList(listMaSinhVien, [newLesson.mabuoihoc]);
            console.log(`Đã khởi tạo điểm danh thành công cho ${listMaSinhVien.length} sinh viên của buổi học ${newLesson.mabuoihoc}`);
        } else {
            console.log(`Lớp ${malop} chưa có sinh viên nào, không tạo điểm danh.`);
        }
        
    } catch (error) {
        console.error("Lỗi khi khởi tạo điểm danh cho buổi học mới:", error);
        
    }
    return newLesson;
}

const dayMap = {
    'Chủ nhật': 0,
    'Hai': 1,
    'Ba': 2,
    'Tư': 3,
    'Năm': 4,
    'Sáu': 5,
    'Bảy': 6
}

const getMatchingDates = (startDate, endDate, dayOfWeek) => {
    const targetDay = dayMap[dayOfWeek];
    if (targetDay === undefined) {
        throw new Error(`Ngày ${dayOfWeek} không hợp lệ`);
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)){
        if (d.getDay() === targetDay) {
            const formatted = d.toLocaleDateString('Vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
            dates.push(formatted);
        }
    }
    return dates;
}

const createBulkLessons = async (malop, giobatdau, gioketthuc, ngaybatdau, ngayketthuc, thuTrongTuan) => {
    if (!malop || !ngaybatdau || !ngayketthuc || !giobatdau || !gioketthuc) {
        const err = new Error("Thiếu thông tin để tạo buổi học");
        err.status = 400;
        throw err;
    }
    const validDates = getMatchingDates(ngaybatdau, ngayketthuc, thuTrongTuan);

    if (validDates.length === 0) {
        const err = new Error(`Không có ngày nào phù hợp`);
        err.status = 400;
        throw err;
    }

    const createdLessons = [];
    const errors = [];

    for (const ngayhoc of validDates){
        try {
            const mabuoihoc = makeMaBuoiHoc(malop, ngayhoc);
            const existed = await lessonRepository.findByMaBuoiHoc(mabuoihoc);
            if (!existed) {
                const newLesson = await lessonRepository.create(mabuoihoc, malop,ngayhoc, giobatdau, gioketthuc, `Buổi học ngày ${ngayhoc}`);
                createdLessons.push(newLesson);
            }
            else{
                errors.push(`Buổi học của lớp ${malop} vào ngày ${ngayhoc} đã tồn tại, bỏ qua tạo mới.`);
            }
        } catch (error) {
            errors.push(`Lỗi khi tạo buổi học cho ngày ${ngayhoc}: ${error.message}`);
        }
    }
    return createdLessons;
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
    getLessonsByMaLop,
    createLesson,
    updateLesson,
    deleteLesson,
    createBulkLessons

}