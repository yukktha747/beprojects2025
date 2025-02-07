require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/adminRoutes");
const predictSepsisRoutes = require("./routes/predictSepsisRoutes");
const authRoutes = require("./routes/authRoutes");  // Import the auth routes

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use the authentication routes for signup and login

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/predict-sepsis", predictSepsisRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
