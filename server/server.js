const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests and same-origin server-to-server calls.
      if (!origin) return callback(null, true);

      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Team Task Manager API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f7f7f7; color: #1f2937; }
          .card { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
          h1 { margin-top: 0; }
          .ok { color: #065f46; font-weight: 700; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
          ul { line-height: 1.8; }
          a { color: #2563eb; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Team Task Manager API</h1>
          <p class="ok">Backend is running.</p>
          <p>Use these routes to test from browser or API client:</p>
          <ul>
            <li><a href="/health">/health</a> <code>GET</code> (JSON health check)</li>
            <li><code>/api/auth/signup</code> <code>POST</code></li>
            <li><code>/api/auth/login</code> <code>POST</code></li>
            <li><code>/api/auth/me</code> <code>GET</code> (requires Bearer token)</li>
          </ul>
        </div>
      </body>
    </html>
  `;
  res.status(200).type("html").send(html);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "team-task-manager-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    if (allowedOrigins.length) {
      console.log(`CORS origins: ${allowedOrigins.join(", ")}`);
    } else {
      console.log("CORS origins: all (set CORS_ORIGINS to restrict)");
    }
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });
