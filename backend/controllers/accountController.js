const accountService = require('../services/accountService');

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
            return res.status(404).json({ error: 'TÃ i khoáº£n khÃ´ng tá»“n táº¡i' });
        }
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    const { userId, username, password, role } = req.body;
    try {
        const newAccount = await accountService.create(userId, username, password, role);
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    const { username } = req.params;
    const { userId, password, role } = req.body;
    try {
        const updatedAccount = await accountService.update(userId, username, password, role);
        res.json(updatedAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAccount = async (req, res) => {
    const { username } = req.params;
    try {
        await accountService.deleteAccount(username);
        res.json({ message: 'XÃ³a tÃ i khoáº£n thÃ nh cÃ´ng' });
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
