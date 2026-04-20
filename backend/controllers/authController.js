const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const accountService = require('../services/accountService');

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Vui lòng cung cấp tên đăng nhập và mật khẩu" });
    }
    const account = await accountService.findByUsername(username);
    if (!account) {
        return res.status(400).json({ error: "Tên đăng nhập không đúng" });
    }
    const pwdMatch = await bcrypt.compare(password, account.password);
    if(!pwdMatch){
        return res.status(400).json({error: "Mật khẩu không đúng"});
    }
    const token = jwt.sign({id: account.mataikhoan, role: account.role}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
    res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: {
            id: account.mataikhoan,
            role: account.role
        }
    });
};

const authenticate = (req, res, next) => {
    const authorization= req.headers.Authorization || req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: "Client không cung cấp token"});
    const token = authorization.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); 
    } catch (error) {
        res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn"});
    }
};

// nhận vào 1 mảng các phân quyền ['admin',...]
// để xác nhận token có được phép thực hiện controller hay không 
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.role) 
            return res.status(403).json({ message: "Không tìm thấy quyền hạn người dùng." });
        
        const isAllowed = allowedRoles.includes(user.role);

        if (isAllowed) 
            next(); 
        else 
            res.status(403).json({ message: "Bạn không có quyền truy cập !" });
    };
};


module.exports ={
    login,
    authenticate,
    authorize
}