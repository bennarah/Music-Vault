const express = require("express");
const cors = require("cors");

require("dotenv").config();

const spotifyTestRouter = require("./routes/spotifyTest");



const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "music-vault-api"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Music Vault API running on port ${PORT}`);
});