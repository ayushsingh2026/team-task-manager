const Task = require("../models/Task");
const Project = require("../models/Project");

const hasProjectAccess = (project, userId) => {
  const asString = String(userId);
  return (
    String(project.owner) === asString ||
    project.members.some((memberId) => String(memberId) === asString)
  );
};

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;

    if (!title || !projectId || !assignedTo || !dueDate) {
      return res
        .status(400)
        .json({ message: "title, projectId, assignedTo and dueDate are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({ message: "No access to this project" });
    }

    const projectMemberIds = project.members.map((id) => String(id));
    if (!projectMemberIds.includes(String(assignedTo))) {
      return res.status(400).json({ message: "Assigned member must be part of active project" });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      dueDate
    });

    const populated = await task.populate("assignedTo", "name email role");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Could not create task", error: error.message });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({ message: "No access to this project" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email role")
      .sort({ dueDate: 1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch tasks", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!hasProjectAccess(task.project, req.user._id)) {
      return res.status(403).json({ message: "No access to this project task" });
    }

    const { title, description, assignedTo, status, dueDate } = req.body;

    if (req.user.role === "member") {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return res.status(403).json({ message: "Members can only update their assigned tasks" });
      }
      if (title !== undefined || description !== undefined || assignedTo !== undefined || dueDate !== undefined) {
        return res.status(403).json({ message: "Members can only update task status" });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    const populated = await task.populate("assignedTo", "name email role");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Could not update task", error: error.message });
  }
};

module.exports = { createTask, getTasksByProject, updateTask };
