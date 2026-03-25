const express = require("express");
const router = express.Router();
const {login, getProfile} = require("../controllers/authController");

//Routes 
router.post("/login", login);
router.get("/profile", getProfile);

module.exports = router;