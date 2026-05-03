const express = require("express");
const { signup, login, me, listMembers } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, authorizeRoles("admin"), listMembers);

module.exports = router;
