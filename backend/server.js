const express = require("express");
const app = express();

app.use(express.json());

//======Routes======
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/studentRoute");
const teacherRoutes = require("./routes/teacherRoute");

//======Middleware======

//======API Routes======
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);

app.get("/", (req, res) => {
  res.send("Xin chào từ Node.js!");
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});