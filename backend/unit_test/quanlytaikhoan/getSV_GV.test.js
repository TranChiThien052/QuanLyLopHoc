const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập, từ chối thực thi', () => {
    it('Lây danh sách tài khoản sinh viên thất bại',async () => {
        const response = await request(app)
        .get('/accounts/sinhvien');

        expect(response.statusCode).toBe(401);
    });
    it('Lây danh sách tài khoản giảng viên thất bại',async () => {
        const response = await request(app)
        .get('/accounts/giangvien');

        expect(response.statusCode).toBe(401);
    });
});

describe('Đã đăng nhập, không có quyền thực thi', () => {
    let testToken= "";
    beforeAll(() => {
        let payload = {id: "DH52200320",role:'student'}
        const secret = process.env.JWT_SECRET;
        testToken = jwt.sign(payload,secret,{expiresIn: '1h'});
    })

    it('Lấy danh sách tài khoản sinh viên thất bại', async () => {
        const response = await request(app)
        .get('/accounts/sinhvien')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(403);
    });

    it('Lấy danh sách tài khoản giảng viên thất bại', async () => {
        const response = await request(app)
        .get('/accounts/giangvien')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(403);
    });
});

describe('Đã đăng nhập', () => {
    let testToken= "";
    beforeAll(() => {
        let payload = {id: "admin00001",role:'admin'}
        const secret = process.env.JWT_SECRET;
        testToken = jwt.sign(payload,secret,{expiresIn: '1h'});
    })

    it('Lấy danh sách tài khoản sinh viên thành công', async () => {
        const response = await request(app)
        .get('/accounts/sinhvien')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(200);
    });

    it('Lấy danh sách tài khoản giảng viên thành công', async () => {
        const response = await request(app)
        .get('/accounts/giangvien')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(200);
    });
});

afterAll(async () => {
    await sequelize.close(); 
});