const request = require('supertest');
const app = require('../../server'); 
const {sequelize} = require('../../models');

describe('Kiểm thử API Login', () => {
    it('Đăng nhập thành công, quyền ADMIN', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username:"admin", password:"admin123"});

        expect(response.statusCode).toBe(200);
        expect(response.body.token);
        expect(response.body.user.role).toBe('admin');
    });

    it('Đăng nhập thành công, quyền TEACHER', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username:"GV_TH00002", password:"GV_TH00002"});

        expect(response.statusCode).toBe(200);
        expect(response.body.token);
        expect(response.body.user.role).toBe('teacher');
    });

    it('Đăng nhập thành công, quyền STUDENT', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username:"DH52201400", password:"DH52201400"});

        expect(response.statusCode).toBe(200);
        expect(response.body.token);
        expect(response.body.user.role).toBe('student');
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
            .post('/auth/login')
            .send({ username:"admin", password:"12"});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Mật khẩu không đúng");
    });

    it('Đăng nhập thất bại, username quá dài', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username:new String(100), password:"DH52201400"});

        expect(response.statusCode).toBe(400);
        expect(response.body.error);
    });
});


afterAll(async () => {
    await sequelize.close();
});