const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

//======Routes======
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/accountRoute");
const classRoutes = require("./routes/classRoute");
const diemDanhRoutes = require("./routes/diemDanhRoute");
const studentRoutes = require("./routes/studentRoute");
const teacherRoutes = require("./routes/teacherRoute");
const lopsinhvienRoutes = require("./routes/lopsinhvienRoute");
const lessonRoutes = require("./routes/lessonRoute");

//======Middleware======

//======API Routes======
app.use("/auth", authRoutes);
app.use("/accounts", accountRoutes);
app.use("/classes", classRoutes);
app.use("/diemDanh", diemDanhRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/lopsinhvien", lopsinhvienRoutes);
app.use("/lessons", lessonRoutes);

app.get("/", (req, res) => {
  res.send("Xin chào từ Node.js!");
});

app.listen(3001, () => {
  console.log("Server chạy tại http://localhost:3000");
});