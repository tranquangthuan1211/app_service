const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("product Service hello everyone balabala");
    });
app.listen(5002, () => {
    console.log("🚀 Product Service running at http://localhost:5002");
    });