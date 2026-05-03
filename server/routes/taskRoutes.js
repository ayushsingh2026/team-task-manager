const express = require("express");
const { createTask, getTasksByProject, updateTask } = require("../controllers/taskController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createTask);
router.get("/:projectId", protect, getTasksByProject);
router.put("/:id", protect, updateTask);

module.exports = router;
