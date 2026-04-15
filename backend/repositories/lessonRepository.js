const { where } = require("sequelize");
const { lesson: Lesson } = require("../models");

const findAll = async () => {
    return await Lesson.findAll();
}

const findByMaBuoiHoc = async (mabuoihoc) => {
    return await Lesson.findOne({
        where: { mabuoihoc }
    });
}

const findByMaLop = async (malop) => {
    return await Lesson.findAll({
        where: {malop}
    })
}

const create = async (mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc) => {
    return await Lesson.create({
        mabuoihoc,
        malop,
        ngayhoc,
        giobatdau,
        gioketthuc,
        noidungbuoihoc
    });
}

const update = async (mabuoihoc, malop, ngayhoc, giobatdau, gioketthuc, noidungbuoihoc) => {
    const lesson = await Lesson.findOne({
        where: { mabuoihoc }
    });
    if (!lesson) {
        throw new Error("Lesson not found");
    }
    return await lesson.update({
        malop,
        ngayhoc,
        giobatdau,
        gioketthuc,
        noidungbuoihoc
    });
}

const remove = async (mabuoihoc) => {
    const lesson = await Lesson.findOne({
        where: { mabuoihoc }
    });
    if (!lesson) {
        throw new Error("Lesson not found");
    }   
    return await lesson.destroy();
}

module.exports = {
    findAll,
    findByMaBuoiHoc,
    findByMaLop,
    create,
    update,
    remove
}