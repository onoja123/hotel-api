const express = require("express")
const router = express();

const authController = require("../controllers/auth.controller")

router.post("/signup", authController.signup)

router.post("/adminlogin", authController.admin)

router.post("/login",authController.login)

router.post('/forgotPassword', authController.forgotPassword);

router.patch("/resetpassword/:token", authController.resetPassword)

router.put("/verify/:token", authController.verify)

router.post("/resendverification", authController.resendVerification)

router.post("/logout", authController.logout)

module.exports = router;