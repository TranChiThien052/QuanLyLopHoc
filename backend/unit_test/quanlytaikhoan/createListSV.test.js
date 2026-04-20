const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const path = require('path');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập', () => {

    it('Tạo danh sách bại', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.xlsx');
        const response = await request(app)
        .post('/students/bulk')
        .set('Authorization', `Bearer `)
    
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

    it('Tạo danh sách thát bại', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.xlsx');
        const response = await request(app)
        .post('/students/bulk')
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

    it('Tạo danh sách thành công', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.xlsx');
        const response = await request(app)
        .post('/students/bulk')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('excelFile',filePath)
    
        expect(response.statusCode).toBe(200);
    });

    it('Tạo danh sách thất bại, sai định dạng file', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.txt');
        const response = await request(app)
        .post('/students/bulk')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('excelFile',filePath)
    
        expect(response.statusCode).toBe(400);
    });

    it('Tạo danh sách thất bại, thiếu cột quan trọng', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test-thieu-ma.xlsx');
        const response = await request(app)
        .post('/students/bulk')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('excelFile',filePath)
    
        expect(response.statusCode).toBe(400);
    });

    it('Tạo danh sách thất bại, định dạng dữ liệu không đúng', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test-sai-dinh-dang.xlsx');
        const response = await request(app)
        .post('/students/bulk')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('excelFile',filePath)
    
        expect(response.statusCode).toBe(500);
    });
});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});