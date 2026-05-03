const express = require("express");
const { createProject, getProjects } = require("../controllers/projectController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createProject);
router.get("/", protect, getProjects);

module.exports = router;
