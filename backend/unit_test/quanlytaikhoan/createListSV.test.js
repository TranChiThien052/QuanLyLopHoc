const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const path = require('path');
const jwt = require('jsonwebtoken');

describe('Kiểm thử API Tạo DSSV', () => {
    let testToken = "";

    beforeAll(() => {
        const payload = { id: 'admin00001',role:'admin' };
        const secret = process.env.JWT_SECRET || 'your_secret_key';
        //testToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    });

    it('Tạo danh sách fail', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.xlsx');
        const response = await request(app)
        .post('/students/bulk')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('excelFile', filePath)
    
        expect(response.statusCode).toBe(403);
       
    });
});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});