const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const LopHoc = sequelize.define(
        "LopHoc",
        {
            ma_lop: {
                type: DataTypes.CHAR(14),
                primaryKey: true,
                allowNull: false,
            },
            ten_lop: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            mon_hoc: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            giao_vien: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
        },
        {
            tableName: "lophoc",
            timestamps: false,
            freezeTableName: true,
        }
    );

    return LopHoc;
};