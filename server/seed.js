require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  const adminEmail = "admin@teamtask.com";
  const memberEmail = "member@teamtask.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Admin User",
      email: adminEmail,
      password: passwordHash,
      role: "admin"
    });
  }

  let member = await User.findOne({ email: memberEmail });
  if (!member) {
    member = await User.create({
      name: "Member User",
      email: memberEmail,
      password: passwordHash,
      role: "member"
    });
  }

  let project = await Project.findOne({ name: "Team Website Revamp", owner: admin._id });
  if (!project) {
    project = await Project.create({
      name: "Team Website Revamp",
      description: "Redesign marketing website and improve load times",
      owner: admin._id,
      members: [admin._id, member._id]
    });
  }

  const existingTasks = await Task.countDocuments({ project: project._id });
  if (existingTasks === 0) {
    await Task.insertMany([
      {
        title: "Create wireframes",
        description: "Initial UX wireframes for home and pricing pages",
        project: project._id,
        assignedTo: member._id,
        status: "in-progress",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Set up deployment pipeline",
        description: "Add CI build and deployment checks",
        project: project._id,
        assignedTo: admin._id,
        status: "pending",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Fix SEO metadata",
        description: "Update title, description and OG tags",
        project: project._id,
        assignedTo: member._id,
        status: "completed",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);
  }

  console.log("Seed completed");
  console.log("Admin: admin@teamtask.com / password123");
  console.log("Member: member@teamtask.com / password123");

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
