const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập', () => {

    it('Tạo tài khoản thất bại', async () => {
        const response = await request(app)
        .post('/teachers/')
    
        expect(response.statusCode).toBe(401);
       
    });
});

describe('Đã đăng nhập, không có quyền', () => {
    let testToken = "";

    beforeAll(() => {
        const payload = { id: 'DH52200320',role:'student' };
        const secret = process.env.JWT_SECRET || 'your_secret_key';
        testToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    });

    it('Tạo tài kkhoản thát bại', async () => {
        const response = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(403);
       
    });
});

describe('Đã đăng nhập', () => {
    let testToken = "";

    beforeAll(() => {
        const payload = { id: 'admin00001',role:'admin' };
        const secret = process.env.JWT_SECRET || 'your_secret_key';
        testToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    });

    it('Tạo tài kkhoản thành công', async () => {
        const response = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            magiangvien: "GV_TH00001",
            ten:"Bằng",
            holot:"Bùi Nhật",
            ngaysinh:"1990-01-01",
            email:"GV_TH00001@teacher.stu.edu.vn",
            sodienthoai:"0123456744"
        })
        
    
        expect(response.statusCode).toBe(200);
       
    });

    it('Tạo thất bại, mã quá dài', async () => {
        const response = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            magiangvien: "GV_TH00001abc",
            ten:"Bằng",
            holot:"Bùi Nhật",
            ngaysinh:"1990-01-01",
            email:"GV_TH00001@teacher.stu.edu.vn",
            sodienthoai:"0123456733"
        })
    
        expect(response.statusCode).toBe(500);
    });

    it('Tạo thất bại, email sai định dạng', async () => {
        const response = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            magiangvien: "GV_TH00001",
            ten:"Bằng",
            holot:"Bùi Nhật",
            ngaysinh:"1990-01-01",
            email:"GV_TH00001.teacher.stu.edu.vn",
            sodienthoai:"0123456733"
        })
    
        expect(response.statusCode).toBe(500);
    });

    it('Tạo thất bại, sđt sai định dạng', async () => {
        const response = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            magiangvien: "GV_TH00001",
            ten:"Bằng",
            holot:"Bùi Nhật",
            ngaysinh:"1990-01-01",
            email:"GV_TH00001@teacher.stu.edu.vn",
            sodienthoai:"012345673301"
        })
    
        expect(response.statusCode).toBe(500);
    });

    it('Tạo thất bại, email trùng', async () => {
        const response = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            magiangvien: "GV_TH00001",
            ten:"Bằng",
            holot:"Bùi Nhật",
            ngaysinh:"1990-01-01",
            email:"dh52201401@gmail.com",
            sodienthoai:"0123456733"
        })
    
        expect(response.statusCode).toBe(500);
    });

    it('Tạo thất bại, tên chứa khoảng trắng', async () => {
        const response = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            magiangvien: "GV_TH00001",
            ten:"Bằng abc",
            holot:"Bùi Nhật",
            ngaysinh:"1990-01-01",
            email:"GV_TH00001@teacher.stu.edu.vn",
            sodienthoai:"0123456733"
        })
    
        expect(response.statusCode).toBe(500);
    });
});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});