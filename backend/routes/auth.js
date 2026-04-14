const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

//Routes 
router.post("/login", login);

module.exports = router;