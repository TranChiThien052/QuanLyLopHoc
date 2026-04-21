const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const path = require('path');
const jwt = require('jsonwebtoken');


describe('Chưa đăng nhập', () => {

    it('Tạo danh sách lớp thất bại', async () => {
        const response = await request(app)
        .post('/classes')
    
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

    it('Tạo danh sách lớp thất bại', async () => {
        const response = await request(app)
        .post('/students/bulk')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(403);
    });
});

describe('Tạo danh sách lớp', () => {
    let testToken = "";

    beforeAll(() => {
        const payload = { id: 'GV_TH00002',role:'teacher' };
        const secret = process.env.JWT_SECRET || 'your_secret_key';
        testToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    });

    it('Tạo lớp thành công', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.xlsx');
        const response = await request(app)
        .post('/classes')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('excelFile', filePath)
        .field('MonHoc', 'Lap trinh AI')
        .field('NgayBatDau', '2026-10-01')
        .field('NgayKetThuc', '2027-10-10')
        .field('NgayHocCoDinh', 'Ba')
        .field('GioBatDau', '15:00:00')
        .field('GioKetThuc', '17:35:00')
        .field('MaGiangVien', 'GV_TH00002')
    
        expect(response.statusCode).toBe(200);
       
    });
    
    it('Tạo lớp thất bại, file không dúng định dạng ', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.txt');
        
        const response = await request(app)
        .post('/classes')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', filePath);
    
        expect(response.statusCode).toBe(400);
    });

    it('Tạo lớp thất bại, thiếu mã sinh viên', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test-thieu-ma.txt');
        
        const response = await request(app)
        .post('/classes')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', filePath);
    
        expect(response.statusCode).toBe(500);
    });

    it('Tạo lớp thất bại, sai định dạng email', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test-sai-email.txt');
        
        const response = await request(app)
        .post('/classes')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', filePath);
    
        expect(response.statusCode).toBe(500);
    });

    it('Tạo lớp thất bại, sai định dạng dữ liệu', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test-du-ma.txt');
        
        const response = await request(app)
        .post('/classes')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', filePath);
    
        expect(response.statusCode).toBe(500);
    });
});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});