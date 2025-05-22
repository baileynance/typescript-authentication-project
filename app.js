"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var app = express();
app.use(express.json());
var port = 3000;
app.set("view engine", "ejs");
app.get("/", function (req, res) {
    res.render("index");
});
var authenticateRouter = require("./routes/authenticate.js");
app.use("/auth", authenticateRouter);
app.listen(port, function (error) {
    if (error) {
        console.log("Something went wrong", error);
    }
    else {
        console.log("Server is listening on port ".concat(port));
    }
});
