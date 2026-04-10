const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
  const TaiKhoan = sequelize.define(
    "TaiKhoan",
    {
      mataikhoan: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
        unique: true,
        allowNull: false,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        unique: true,
        validate: {
            len: [4, 50],
            is: /^[a-zA-Z0-9_]+$/i
        }
      },
      password: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
    },
    {
      tableName: "taikhoan",
      timestamps: false,
    },
  );
  return TaiKhoan;
};
