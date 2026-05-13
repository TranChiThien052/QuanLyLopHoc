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
            tenlop: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            monhoc: {
                type: DataTypes.STRING(40),
                allowNull: false,
            },
            ngaybatdau: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            ngayketthuc: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            ngayhoccodinh: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            giobatdau: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            gioketthuc: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            magiangvien: {
                type: DataTypes.CHAR(10),
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