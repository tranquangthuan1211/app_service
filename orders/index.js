const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("order Service anh em hom nay là thu7");
    });
app.listen(5003, () => {
    console.log("🚀 Order Service running at http://localhost:5003");
    });