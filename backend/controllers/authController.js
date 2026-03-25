const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function getJwtConfigError(){
    if(!process.env.JWT_SECRET){
        return "Token chưa được cấu hình";
}
    return null;
}

// Hàm lấy Token từ header và xác minh người dùng
function getUserFromAuthHeader(req){
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {error: "Không có Token tồn tại"};
    }
    const token = authHeader.split(" ")[1];
    const jwtConfigError = getJwtConfigError();
    if(jwtConfigError){
        return {error: jwtConfigError};
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {user: decoded};
    } catch (error) {
        return {error: "Token không hợp lệ"};
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Vui lòng cung cấp tên đăng nhập và mật khẩu" });
    }
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if(userResult.rows.length === 0){
        return res.status(400).json({error: "Tên đăng nhập hoặc mật khẩu không đúng"});
    }
    const pwdMatch = await bcrypt.compare(password, userResult.rows[0].password);
    if(!pwdMatch){
        return res.status(400).json({error: "Tên đăng nhập hoặc mật khẩu không đúng"});
    }
    const jwtConfigError = getJwtConfigError();
    if(jwtConfigError){
        return res.status(500).json({error: jwtConfigError});
    }
    const user = userResult.rows[0];

    // Tạo token với thông tin người dùng
    const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
    res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: {
            id: user.id,
            role: user.role
        }
    });
};

const getProfile = async (req, res) => {
    try {
        const auth = getUserFromAuthHeader(req);
        if(auth.error){
            return res.status(401).json({error: auth.error});
        }
        const userId = auth.user.id;
        const userResult = await pool.query("SELECT id, username, role FROM users WHERE id = $1", [userId]);
        if(userResult.rows.length === 0){
            return res.status(404).json({error: "Người dùng không tồn tại"});
        }
        res.status(200).json({user: userResult.rows[0]});
        
    } catch (error) {
        res.status(500).json({error: "Lỗi máy chủ"});
        
    }
}

module.exports ={
    login,
    getProfile
}