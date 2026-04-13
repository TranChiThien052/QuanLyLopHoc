const accountRepo = require('../repositories/accountRepository');

const findAll = async () => {
    return await accountRepo.findAll();
};

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
    findByUsername,
    create,
    update,
    deleteAccount
};
