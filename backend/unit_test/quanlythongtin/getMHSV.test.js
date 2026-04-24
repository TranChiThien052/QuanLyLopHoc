const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập', () => {
    it('Lây danh sách môn học thất bại',async () => {
        const response = await request(app)
        .get('/students/ds/monhoc');

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

    it('Lấy danh sách môn học thành công', async () => {
        const response = await request(app)
        .get('/students/ds/monhoc')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(200);
        expect(response.body.malop);
    });
});

afterAll(async () => {
    await sequelize.close(); 
});