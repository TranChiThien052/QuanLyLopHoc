const accountRepo = require('../repotosiries/accountRepository');

const findAll = async () => {
    return await accountRepo.findAll();
};

const findByUsername = async (username) => {
    if (!username) {
        throw new Error('Thiếu dữ liệu tên đăng nhập');
    }
    return await accountRepo.findByUsername(username);
};

const create = async (userId, username, password, role) => {
    if (!userId || !username || !password || !role) {
        throw new Error('Thiếu dữ liệu để tạo tài khoản');
    }
    return await accountRepo.create(userId, username, password, role);
};

const update = async (userId, username, password, role) => {
    if (!userId || !username || !password || !role) {
        throw new Error('Thiếu dữ liệu để cập nhật tài khoản');
    }
    return await accountRepo.update(userId, username, password, role);
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
