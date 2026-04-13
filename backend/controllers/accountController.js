const accountService = require('../services/accountService');
const bcrypt = require('bcrypt');

const findAll = async (req, res) => {
    try {
        const accounts = await accountService.findAll();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const findByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const account = await accountService.findByUsername(username);
        if (!account) {
            return res.status(404).json({ error: 'Tài khoản không tồn tại' });
        }
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    const { mataikhoan, username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
        const newAccount = await accountService.create(mataikhoan, username, hashedPassword, role);
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    const { username } = req.params;
    const { mataikhoan, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
        const updatedAccount = await accountService.update(mataikhoan, username, hashedPassword, role);
        res.json(updatedAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAccount = async (req, res) => {
    const { username } = req.params;
    try {
        await accountService.deleteAccount(username);
        res.json({ message: 'Xóa tài khoản thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    findAll,
    findByUsername,
    create,
    update,
    deleteAccount
};