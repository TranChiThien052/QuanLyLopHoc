const express = require("express");
const bcrypt = require('bcrypt');
const app = express();

app.get("/", (req, res) => {
  res.send("Xin chào từ Node.js!");
});

app.use(express.json());

app.post("/createAccount", async (req,res) => {
  const hasdBcrypt = await bcrypt.hash(req.body.pass,10);
  res.status(200).json({code:200,data:hasdBcrypt});
});

app.post('/loginTest', async (req, res) => {
  const myPass = "$2b$10$0fXGKGntaWe/BC/UZwefaesaeBmgU5SqQnaNbePOzft/qUJJJwS2q";
  const isMatch = await bcrypt.compare(req.body.pass, myPass);
  if(isMatch){
    res.status(200).json(
      {
        code:200,
        data:{
          token:""
        }
      });
  }
  else
    res.status(401).json(
      {
        code:401,
        message:"Đăng nhập thất bại !"
      }
    );
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});