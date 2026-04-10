const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DiemDanh = sequelize.define(
    "DiemDanh",
    {
      madiemdanh: {
        type: DataTypes.STRING(25),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      masinhvien: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      mabuoihoc: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      trangthai: {
        type: DataTypes.STRING(20),
      },
      ghichu: {
        type: DataTypes.TEXT,
      },
      thoigiancapnhat: {
        type: DataTypes.DATE,
      },
      manguoicapnhat: {
        type: DataTypes.STRING(10),
      },
    },
    {
      tableName: "diemdanh",
      timestamps: false,
    },
  );
  return DiemDanh;
};
