const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, 
  {
    dialect: "postgres",
    logging: false,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
    pool: {
      max: 6,
      min: 0,
      acquire: 25000,
      idle: 10000,
      evict: 10000,
    },
  },
);

// 1. Nhập (Import) các Model
const TaiKhoan = require("./account")(sequelize);
const SinhVien = require("./student")(sequelize);
const GiangVien = require("./teacher")(sequelize);
const LopHoc = require("./class")(sequelize);
const BuoiHoc = require("./lesson")(sequelize);
const DiemDanh = require("./diemdanh")(sequelize);
const Lop_SinhVien = require("./lopsinhvien")(sequelize);

// 2. Thiết lập Quan hệ (ĐÂY LÀ NƠI BẠN VIẾT CODE ĐÓ)
// --- Quan hệ 1-n giữa GiangVien và LopHoc ---
GiangVien.hasMany(LopHoc, { foreignKey: "magiangvien" });
LopHoc.belongsTo(GiangVien, { foreignKey: "magiangvien" });

// --- Quan hệ n-n giữa SinhVien và LopHoc ---
SinhVien.belongsToMany(LopHoc, { through: Lop_SinhVien, foreignKey: "masinhvien" });
LopHoc.belongsToMany(SinhVien, { through: Lop_SinhVien, foreignKey: "malop" });

// --- Quan hệ 1-n giữa LopHoc và BuoiHoc ---
LopHoc.hasMany(BuoiHoc, { foreignKey: "malop" });
BuoiHoc.belongsTo(LopHoc, { foreignKey: "malop" });

// --- Quan hệ cho DiemDanh ---
DiemDanh.belongsTo(SinhVien, { foreignKey: "masinhvien" });
DiemDanh.belongsTo(BuoiHoc, { foreignKey: "mabuoihoc" });
// 3. Xuất các đối tượng để dùng ở Controller
module.exports = {
  sequelize,
  TaiKhoan,
  SinhVien,
  GiangVien,
  LopHoc,
  BuoiHoc,
  DiemDanh,
  Lop_SinhVien,
  account: TaiKhoan,
  class: LopHoc,
  diemdanh: DiemDanh,
  lesson: BuoiHoc,
  lopsinhvien: Lop_SinhVien
};