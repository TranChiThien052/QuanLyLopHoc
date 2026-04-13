const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const BuoiHoc = sequelize.define(
        "BuoiHoc",
        {
            mabuoihoc: {
                type: DataTypes.STRING(15),
                primaryKey: true,
                allowNull: false,
            },
            malop: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ngayhoc: {
                type: DataTypes.DATEONLY,
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
            noidungbuoihoc: {
                type: DataTypes.TEXT,
                allowNull: true,
            }
        },
        {
            tableName: "buoihoc",
            timestamps: false,
        }
    );

    return BuoiHoc;
};
