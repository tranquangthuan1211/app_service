const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("product Service");
    });
app.listen(5002, () => {
    console.log("🚀 User Service running at http://localhost:5002");
    });