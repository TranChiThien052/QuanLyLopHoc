const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const SinhVien = sequelize.define(
		"SinhVien",
		{
			ma_sv: {
				type: DataTypes.CHAR(10),
				primaryKey: true,
				allowNull: false,
			},
			ho_ten: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			ngay_sinh: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
				validate: {
					isEmail: true,
				},
			},
			so_dien_thoai: {
				type: DataTypes.STRING(15),
				allowNull: true,
			},
			ma_lop: {
				type: DataTypes.CHAR(14),
				allowNull: true,
				references: {
					model: "LopHoc",
					key: "ma_lop",
				},
				onDelete: "SET NULL",
			},
		},
		{
			tableName: "sinhvien",
			timestamps: false,
			freezeTableName: true,
		}
	);

	return SinhVien;
};
