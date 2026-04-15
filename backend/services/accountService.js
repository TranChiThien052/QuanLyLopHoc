const accountRepo = require('../repositories/accountRepository');
const bcrypt = require('bcrypt');

const findAll = async () => {
    return await accountRepo.findAll();
};

const findAllSinhVien = async () => {
    return await accountRepo.findAllSinhVien();
}

const findAllGiangVien = async () => {
    return await accountRepo.findAllGiangVien();
}

const findByUsername = async (username) => {
    if (!username) {
        throw new Error('Thiếu dữ liệu tên đăng nhập');
    }
    return await accountRepo.findByUsername(username);
};

const create = async (mataikhoan, username, password, role) => {
    if (!mataikhoan || !username || !password || !role) {
        throw new Error('Thiếu dữ liệu để tạo tài khoản');
    }
    return await accountRepo.create(mataikhoan, username, password, role);
};

const createBulk = async (listSinhVien) => {
    const listAccounts = [];
    for (const sinhvien of listSinhVien) {
        const password = await bcrypt.hash(sinhvien.MaSinhVien, Number(process.env.SALT_ROUNDS));
        const account = { mataikhoan: sinhvien.MaSinhVien, username: sinhvien.MaSinhVien, password, role: 'student' };
        listAccounts.push(account);
    }
    return await accountRepo.createBulk(listAccounts);
};

const update = async (mataikhoan, username, password, role) => {
    if (!mataikhoan || !username || !password || !role) {
        throw new Error('Thiếu dữ liệu để cập nhật tài khoản');
    }
    return await accountRepo.update(mataikhoan, username, password, role);
};

const deleteAccount = async (username) => {
    if (!username) {
        throw new Error('Thiếu dữ liệu tên đăng nhập');
    }
    return await accountRepo.deleteAccount(username);
};

module.exports = {
    findAll,
    findAllSinhVien,
    findAllGiangVien,
    findByUsername,
    create,
    createBulk,
    update,
    deleteAccount
};
