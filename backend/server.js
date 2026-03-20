const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Xin chào từ Node.js!");
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});