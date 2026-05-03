const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Please add at least one member to the project" });
    }

    const validMembers = await User.find({ _id: { $in: members }, role: "member" }).select("_id");
    if (validMembers.length !== members.length) {
      return res.status(400).json({ message: "One or more selected members are invalid" });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: Array.from(new Set([...validMembers.map((m) => String(m._id)), String(req.user._id)]))
    });

    const populated = await project.populate("members", "name email role");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Could not create project", error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    })
      .populate("owner", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch projects", error: error.message });
  }
};

module.exports = { createProject, getProjects };
