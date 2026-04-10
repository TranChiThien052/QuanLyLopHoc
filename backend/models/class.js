const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const LopHoc = sequelize.define(
        "LopHoc",
        {
            malop: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },
            TenLop: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            monhoc: {
                type: DataTypes.STRING(40),
                allowNull: false,
            },
            magiangvien: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
        },
        {
            tableName: "lophoc",
            timestamps: false,
        }
    );

    return LopHoc;
};