const express = require("express");
const { createuser, loginuser, sendEmail, changePassword, optValid } = require("../Controller/UserController");
const route = express.Router();

route.post("/createuser",createuser)
route.post("/userlogin",loginuser)
route.post("/sendmail",sendEmail)
route.post('/changePassword',changePassword)
route.post('/optValid',optValid)

module.exports= route