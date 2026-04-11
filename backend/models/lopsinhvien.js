const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Lop_SinhVien = sequelize.define(
    "Lop_SinhVien",
    {
      malop: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      masinhvien: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
    },
    { 
        tableName: "lop_sinhvien", 
        timestamps: false 
    },
  );
  return Lop_SinhVien;
};
