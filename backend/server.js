const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const { sequelize, SinhVien, LopHoc } = require("./model");

const app = express();

app.get("/", (req, res) => {
  res.send("Xin chào từ Node.js!");
});

app.use(express.json());

app.post("/lopHoc/Create", async (req, res) => {
  try {
    const { ma_lop, ten_lop, mon_hoc, giao_vien } = req.body;
    const newLopHoc = await LopHoc.create({
      ma_lop,
      ten_lop,
      mon_hoc,
      giao_vien,
    });
    res.status(201).json(newLopHoc);
  } catch (error) {
    console.error("Lỗi khi tạo lớp học:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

app.post("/sinhVien/Create", async (req, res) => {
  try {
    const { ma_sv, ho_ten, ngay_sinh, email, so_dien_thoai, ma_lop } = req.body;

    const newSinhVien = await SinhVien.create({
      ma_sv,
      ho_ten,
      ngay_sinh,
      email,
      so_dien_thoai,
      ma_lop,
    });
    res.status(201).json(newSinhVien);
  } catch (error) {
    console.error("Lỗi khi tạo sinh viên:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Da ket noi PostgreSQL thanh cong");

    app.listen(PORT, () => {
      console.log(`Server chay tai http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Khong the ket noi PostgreSQL:", error.message || error);
    process.exit(1);
  }
};

startServer();