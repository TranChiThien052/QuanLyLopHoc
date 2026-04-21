const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập', () => {

    it('Chưa đăng nhập, không thực thi', async () => {
        const response = await request(app)
        .put('/students')
    
        expect(response.statusCode).toBe(401);
       
    });
});

describe('Đã đăng nhập, không có quyền', () => {
    let testToken = "";

    beforeAll(() => {
        const payload = { id: 'GV_TH00001',role:'teacher' };
        const secret = process.env.JWT_SECRET || 'your_secret_key';
        testToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    });

    it('Cập nhật thông tin thát bại', async () => {
        const response = await request(app)
        .put('/students/')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(403);
       
    });
});

describe('Đã đăng nhập', () => {
    let testToken = "";

    beforeAll(() => {
        const payload = { id: 'DH52200320',role:'student' };
        const secret = process.env.JWT_SECRET || 'your_secret_key';
        testToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    });

    it('Cập nhật thông tin thành công', async () => {
        const response = await request(app)
        .put('/students')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            ten:"Tâm",
            holot:"Đặng Võ Phương Anh",
            ngaysinh:"2004-01-01",
            email:"DH52200320@student.stu.edu.vn",
            sodienthoai:"0123456722"
        })
    
        expect(response.statusCode).toBe(200);
    });

    it('Cập nhật thông tin thất bại, trùng mail', async () => {
        const response = await request(app)
        .put('/students')
        .set('Authorization', `Bearer ${testToken}`) 
        .send({
            ten:"Tâm",
            holot:"Đặng Võ Phương Anh",
            ngaysinh:"2004-01-01",
            email:"dh52201400@gmail.com",
            sodienthoai:"0123456722"
        })
    
        expect(response.statusCode).toBe(500);
    });

    it('Cập nhật thông tin thất bại, trùng số điện thoại', async () => {
        const response = await request(app)
        .put('/students')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            ten:"Tâm",
            holot:"Đặng Võ Phương Anh",
            ngaysinh:"2004-01-01",
            email:"DH52200320@student.stu.edu.vn",
            sodienthoai:"0123456789"
        })
        
        expect(response.statusCode).toBe(500);
    });

    it('Cập nhật thông tin thất bại, định dạng tên sai', async () => {
        const response = await request(app)
        .put('/students')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            ten:"Tâm abc",
            holot:"Đặng Võ Phương Anh",
            ngaysinh:"2004-01-01",
            email:"DH52200320@student.stu.edu.vn",
            sodienthoai:"0123456722"
        })
        
        expect(response.statusCode).toBe(500);
    });

    it('Cập nhật thông tin thất bại, định dạng mail sai', async () => {
        const response = await request(app)
        .put('/students')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            ten:"Tâm abc",
            holot:"Đặng Võ Phương Anh",
            ngaysinh:"2004-01-01",
            email:"DH52200320student",
            sodienthoai:"0123456722"
        })
        
        expect(response.statusCode).toBe(500);
    });

    it('Cập nhật thông tin thất bại, định dạng sđt sai', async () => {
        const response = await request(app)
        .put('/students')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            ten:"Tâm abc",
            holot:"Đặng Võ Phương Anh",
            ngaysinh:"2004-01-01",
            email:"DH52200320@student.stu.edu.vn",
            sodienthoai:"01234567"
        })
        
        expect(response.statusCode).toBe(500);
    });

});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});