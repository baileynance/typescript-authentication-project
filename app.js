"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var fs = require("fs");
var dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var app = express();
app.set("view-engine", "ejs");
app.use(express.json());
// Create Server
var port = 3000;
var server = http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/ejs" });
    fs.readFile("./views/index.ejs", function (error, data) {
        if (error) {
            res.writeHead(404);
            res.write("Error: File Not Found");
        }
        else {
            res.write(data);
        }
        res.end();
    });
});
server.listen(port, function (error) {
    if (error) {
        console.log("Something went wrong", error);
    }
    else {
        console.log("Server is listening on port ".concat(port));
    }
});
var testRouter = require("./routes/test.js");
app.use("/test", testRouter);
