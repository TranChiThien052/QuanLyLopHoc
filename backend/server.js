const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

//======Routes======
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/accountRoute");
const classRoutes = require("./routes/classRoute");
const diemDanhRoutes = require("./routes/diemDanhRoute");
//======Middleware======

//======API Routes======
app.use("/auth", authRoutes);
app.use("/accounts", accountRoutes);
app.use("/classes", classRoutes);
app.use("/diemDanh", diemDanhRoutes);
app.get("/", (req, res) => {
  res.send("Xin chào từ Node.js!");
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});