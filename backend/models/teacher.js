const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GiangVien = sequelize.define(
    "GiangVien",
    {
      magiangvien: {
        type: DataTypes.STRING(10),
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
          is: /^[0-9]{10}$/,
        },
      },
    },
    {
      tableName: "giangvien",
      timestamps: false,
    },
  );
  return GiangVien;
};
