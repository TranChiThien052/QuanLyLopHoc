const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập', () => {

    it('Chưa đăng nhập, không thực thi', async () => {
        const response = await request(app)
        .put('/students/update-faceid')
    
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
        .put('/students/update-faceid')
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
        .put('/students/update-faceid')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            faceid: [-0.113,0.113]
        })
    
        expect(response.statusCode).toBe(200);
    });

    it('Cập nhật thông tin thất bại, dữ liệu face id không hợp lệ', async () => {
        const response = await request(app)
        .put('/students/update-faceid')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            faceid: "abc"
        })
    
        expect(response.statusCode).toBe(500);
    });

});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});