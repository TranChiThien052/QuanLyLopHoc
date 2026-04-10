const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SinhVien = sequelize.define(
    "SinhVien",
    {
      masinhvien: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
        unique: true,
        allowNull: false,
        autoIncrement: true,
      },
      ten: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      holot: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      ngaysinh: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      sodienthoai: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        unique: true,
        validate: {
          isSdt: /^[0-9]{10}$/,
        },
      },
      malop: {
        type: DataTypes.CHAR(10),
        allowNull: true,
      },
      faceid: {
        type: DataTypes.ARRAY(DataTypes.DOUBLE),
        allowNull: true,
      },
    },
    {
      tableName: "sinhvien",
      timestamps: false,
    },
  );

  return SinhVien;
};
