const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const jwt = require('jsonwebtoken');

describe('Chưa đăng nhập', () => {
    it('Không thể thực thi',async () => {
        const response = await request(app)
        .post('/diemDanh/thu-cong');

        expect(response.statusCode).toBe(401);
    })
});


describe('Đã đăng nhập, không có quyền', () => {
    let testToken = "";

    beforeAll(() => {
        const payload = { id: 'DH52200320',role:'student' };
        const secret = process.env.JWT_SECRET;
        testToken = jwt.sign(payload, secret, { expiresIn: '1h' });
    });

    it('Từ chối thực thi', async () => {
        const response = await request(app)
        .post('/diemDanh/thu-cong')
        .set('Authorization', `Bearer ${testToken}`)
    
        expect(response.statusCode).toBe(403);
    });
});

describe('Đã đăng nhập', () => {
    let testToken= "";
    beforeAll(() => {
        let payload = {id: "GV_TH00001",role:'teacher'}
        const secret = process.env.JWT_SECRET;
        testToken = jwt.sign(payload,secret,{expiresIn: '1h'});
    })

    it('Diểm danh thủ công thành công', async () => {
        const response = await request(app)
        .post('/diemDanh/thu-cong')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            maBuoiHoc: "42_06102026",
            danhSachDiemDanh: [
                {
                    "maSinhVien":"DH52200320",
                    "trangThai":"có mặt"
                },
                {
                    "maSinhVien":"DH52300086",
                    "trangThai":"có mặt",
                    "ghiChu":"đi trễ"
                },
                {
                    "maSinhVien":"DH52300129",
                    "trangThai":"có mặt"
                },
            ]
        })
    
        expect(response.statusCode).toBe(200);
    });

    it('Diểm danh thủ công thất bại, thiếu trạng thái điểm danh', async () => {
        const response = await request(app)
        .post('/diemDanh/thu-cong')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            maBuoiHoc: "42_06102026",
            danhSachDiemDanh: [
                {
                    "maSinhVien":"DH52200320",
                    "trangThai":"có mặt"
                },
                {
                    "maSinhVien":"DH52300086",
                    "trangThai":"có mặt",
                    "ghiChu":"đi trễ"
                },
                {
                    "maSinhVien":"DH52300129"
                },
            ]
        })
    
        expect(response.statusCode).toBe(500);
        expect(response.body.error);
    });
});

afterAll(async () => {
    await sequelize.close(); 
});