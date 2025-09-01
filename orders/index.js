const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("order Service dkjchcj");
    });
app.listen(5003, () => {
    console.log("🚀 User Service running at http://localhost:5003");
    });