const express = require("express");
const cors = require("cors");

require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const spotifyTestRoutes = require("./routes/spotifyTest");

const app = express();

app.use(cors({
    origin: process.env.FRONT_END_URL
}));
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/spotify-test", spotifyTestRoutes);

module.exports = app;