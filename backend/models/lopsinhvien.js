const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Lop_SinhVien = sequelize.define(
    "Lop_SinhVien",
    {
      MaLop: { 
        type: DataTypes.INTEGER, 
        primaryKey: true 
    },
      MaSinhVien: { 
        type: DataTypes.CHAR(10), 
        primaryKey: true 
    },
    },
    { 
        tableName: "Lop_SinhVien", 
        timestamps: false 
    },
  );
  return Lop_SinhVien;
};
