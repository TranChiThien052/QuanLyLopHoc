const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  { 
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

// 1. Nhập (Import) các Model
const SinhVien = require("./student")(sequelize);
const GiangVien = require("./teacher")(sequelize);
const LopHoc = require("./class")(sequelize);
const BuoiHoc = require("./lesson")(sequelize);
const DiemDanh = require("./diemdanh")(sequelize);
const Lop_SinhVien = require("./lopsinhvien")(sequelize);

// 2. Thiết lập Quan hệ (ĐÂY LÀ NƠI BẠN VIẾT CODE ĐÓ)
// --- Quan hệ 1-n giữa GiangVien và LopHoc ---
GiangVien.hasMany(LopHoc, { foreignKey: "MaGiangVien" });
LopHoc.belongsTo(GiangVien, { foreignKey: "MaGiangVien" });

// --- Quan hệ n-n giữa SinhVien và LopHoc ---
SinhVien.belongsToMany(LopHoc, { through: Lop_SinhVien, foreignKey: "MaSinhVien" });
LopHoc.belongsToMany(SinhVien, { through: Lop_SinhVien, foreignKey: "MaLop" });

// --- Quan hệ 1-n giữa LopHoc và BuoiHoc ---
LopHoc.hasMany(BuoiHoc, { foreignKey: "MaLop" });
BuoiHoc.belongsTo(LopHoc, { foreignKey: "MaLop" });

// --- Quan hệ cho DiemDanh ---
DiemDanh.belongsTo(SinhVien, { foreignKey: "MaSinhVien" });
DiemDanh.belongsTo(BuoiHoc, { foreignKey: "MaBuoiHoc" });

// 3. Xuất các đối tượng để dùng ở Controller
module.exports = {
  sequelize,
  SinhVien,
  GiangVien,
  LopHoc,
  BuoiHoc,
  DiemDanh,
  Lop_SinhVien
};