// Configures Express and connects routes

const express = require("express");
const cors = require("cors");

require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const spotifyTestRoutes = require("./routes/spotifyTest");
const spotifyRoutes = require("./routes/spotifyRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];

app.use(cors({
    origin: allowedOrigins,
}));
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/spotify-test", spotifyTestRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/preferences", preferenceRoutes);

module.exports = app;