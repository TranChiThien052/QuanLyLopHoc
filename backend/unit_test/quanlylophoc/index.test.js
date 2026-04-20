const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');

describe('Kiểm thử API Login', () => {
    it('Đăng nhập thành công', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username:"admin", password:"admin123"});

        expect(response.statusCode).toBe(200);
        expect(response.body.token);
    });

    it('Không tôn tại username', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username:"admin1", password:"admin123"});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Tên đăng nhập không đúng");
    });

    it('Không truyền username và password', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username:"", password:""});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Vui lòng cung cấp tên đăng nhập và mật khẩu");
    });

    it('Sai mật khẩu', async () => {
        const response = await request(app)
            .post('/authen')
            .send({ username:"admin1", password:12});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Mật khẩu không đúng");
    });
});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});