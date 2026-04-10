const { account : Account } = required('../models');

const findAll = async () => {
    return await Account.findAll();
}