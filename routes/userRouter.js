const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handleLogin,
  resendVerificationEmail,
  handleForgotPassword,
  handleResetPassword,
  handleUpdateUser,
  handleGetUser
} = require("../controllers/userController");
const { isloggedin, requirePermissions } = require("../middleware/auth");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handleLogin);
router.post("/resend-email/:token", resendVerificationEmail);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword)
router.get("/user", handleGetUser)
router.patch("/user",isloggedin, requirePermissions (["landlord"]), handleUpdateUser)

module.exports = router;
