const { Sequelize } = require("sequelize");
require("dotenv").config();

const initLopHoc = require("./lopHoc");
const initSinhVien = require("./sinhVien");

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
  }
);

const LopHoc = initLopHoc(sequelize);
const SinhVien = initSinhVien(sequelize);

LopHoc.hasMany(SinhVien, {
  foreignKey: "ma_lop",
  sourceKey: "ma_lop",
});

SinhVien.belongsTo(LopHoc, {
  foreignKey: "ma_lop",
  targetKey: "ma_lop",
  onDelete: "SET NULL",
});

module.exports = {
  sequelize,
  LopHoc,
  SinhVien,
};