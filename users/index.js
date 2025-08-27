const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("User Service");
    });
app.listen(5001, () => {
    console.log("🚀 User Service running at http://localhost:5001");
    });