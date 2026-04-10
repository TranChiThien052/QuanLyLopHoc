const { account : Account } = require('../models');

const findAll = async () => {
    return await Account.findAll();
};

const findByUsername = async (username) => {
    return await Account.findOne(
        {
            where: { username : username }
        }
    );
};

const create = async (userId, username, password, role) => {
    return await Account.create({
        userId,
        username,
        password,
        role
    });
};

const update = async (userId, username, password, role) => {
    const account = await Account.findOne(
        { 
            where: { userid : userId, username: username }
        }
    );
    if (!account) {
        throw new Error("Tài khoản không tồn tại");
    }
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

module.exports = {
    findAll,
    findByUsername,
    create,
    update,
    deleteAccount
}