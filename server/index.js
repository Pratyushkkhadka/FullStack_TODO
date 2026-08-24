const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Logging
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
const authRoute = require("./routes/AuthRoute");
const noteRoutes = require("./routes/NoteRoute");

app.use("/api/auth", authRoute);
app.use("/api/notes", noteRoutes); // Removed double authMiddleware here

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});