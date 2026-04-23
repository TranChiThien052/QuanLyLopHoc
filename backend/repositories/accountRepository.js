const { account : Account, sequelize, account } = require('../models');

const findAll = async () => {
    return await Account.findAll();
};

const findAllSinhVien = async () => {
    const [rows] = await sequelize.query(`
        SELECT tk.*, (sv.holot || ' ' || sv.ten) AS hoten
        FROM taikhoan AS tk
        JOIN sinhvien AS sv
        ON tk.mataikhoan = sv.masinhvien`
    );
    return rows;
}

const findAllGiangVien = async () => {
    const [rows] = await sequelize.query(`
        SELECT tk.*, (sv.holot || ' ' || sv.ten) AS hoten
        FROM taikhoan AS tk
        JOIN giangvien AS sv
        ON tk.mataikhoan = sv.magiangvien`
    );
    return rows;
}

const findByUsername = async (username) => {
    return await Account.findOne(
        {
            where: { username : username }
        }
    );
};

const create = async (mataikhoan, username, password, role) => {
    return await Account.create({
        mataikhoan,
        username,
        password,
        role
    });
};

const createBulk = async (listAccount) => {
    const accountObjects = listAccount.map(account => {
        return {
            mataikhoan: account.mataikhoan,
            username: account.username,
            password: account.password,
            role: account.role
        };
    });
    return await Account.bulkCreate(accountObjects, {
        ignoreDuplicates: true 
    });
}

const update = async (mataikhoan, username, password, role) => {
    const account = await Account.findOne(
        { 
            where: { username: username }
        }
    );
    if (!account) {
        throw new Error("Tài khoản không tồn tại");
    }
    account.mataikhoan = mataikhoan;
    account.password = password;
    account.role = role;
    return await account.save();
};

const deleteAccount = async (username) => {
    const account = await Account.findOne(
        {
            where: { username : username }
        }
    );
    if (!account) {
        throw new Error("Tài khoản không tồn tại");
    }
    return await account.destroy();
};

// trả về số dòng xóa, k bắt lỗi
const xoaSinhVienKhoiLopHoc = async (masinhvien) => {
    return await Account.destroy({
        where: {
            username: masinhvien
        }
    });
}

module.exports = {
    findAll,
    findAllSinhVien,
    findAllGiangVien,
    findByUsername,
    create,
    createBulk,
    update,
    deleteAccount,
    xoaSinhVienKhoiLopHoc
}