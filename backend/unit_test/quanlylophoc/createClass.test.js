const request = require('supertest');
const app = require('../../server'); 
const  {sequelize} = require('../../models');
const path = require('path');

describe('Kiểm thử API Tạo lớp', () => {

    it('Tạo lớp thành công', async () => {
        const filePath = path.join(__dirname, 'fileTest/ds-test.xlsx');
        const response = await request(app)
        .post('/classes')
        .attach('excelFile', filePath)
        .field('MonHoc', 'Lap trinh AI')
        .field('NgayBatDau', '2026-10-01')
        .field('NgayKetThuc', '2027-10-10')
        .field('NgayHocCoDinh', 'Ba')
        .field('GioBatDau', '15:00:00')
        .field('GioKetThuc', '17:35:00')
        .field('MaGiangVien', 'GV_TH00002')

        console.log(response)
    
        expect(response.statusCode).toBe(201);
       
    });
    
    // it('Nên tạo lớp thành công với file Excel chuẩn', async () => {
    //     const filePath = path.join(__dirname, 'fixtures/valid-classes.xlsx');
        
    //     const response = await request(app)
    //     .post('/api/classes/import')
    //     .attach('file', filePath);
    
    //     expect(response.statusCode).toBe(201);
    //     expect(response.body).toHaveProperty('insertedCount');
    // });
});


afterAll(async () => {
    await sequelize.close(); // Đóng kết nối DB
});