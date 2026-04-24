const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập', () => {
    it('Lây kết quả điểm danh thất bại',async () => {
        const response = await request(app)
        .get('/diemDanh/classAndSinhVien/21/DH52200320');

        expect(response.statusCode).toBe(401);
    })
});

describe('Đã đăng nhập', () => {
    let testToken= "";
    beforeAll(() => {
        let payload = {id: "DH52200320",role:'student'}
        const secret = process.env.JWT_SECRET;
        testToken = jwt.sign(payload,secret,{expiresIn: '1h'});
    })

    it('Lấy kết quả điểm danh thành công', async () => {
        const response = await request(app)
        .get('/diemDanh/classAndSinhVien/42/DH52200320')
        .set('Authorization', `Bearer ${testToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body[0].masinhvien).toBe("DH52200320");
    });
});

afterAll(async () => {
    await sequelize.close(); 
});