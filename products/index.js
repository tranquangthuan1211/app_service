const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("product service hhfh");
    });
app.listen(5002, () => {
    console.log("🚀 Product Service running at http://localhost:5002");
    });