const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoute = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoute);

app.get("/", (req, res) => {
  res.send("Harshit VoiceBot Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
