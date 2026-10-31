// backend/server.js

import express from "express";
import cors from "cors";
import "dotenv/config";

import financeRoutes from "./routes/financeRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Subscription Management System API is running!");
});

// Health-check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Subscription Management API is running",
  });
});

// Finance routes
app.use("/api/finance", financeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});