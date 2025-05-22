"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var fs = require("fs");
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var app = express();
app.use(express.json());
// Create Server
var port = 3000;
var server = http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile("index.html", function (error, data) {
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
// Authenticate
var refreshTokens = [];
app.post("/token", function (req, res) {
    var refreshToken = req.body.token;
    if (refreshTokens == null) {
        return res.status(401);
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function (err, decoded) {
        if (err || typeof decoded !== 'object' || !decoded || !('name' in decoded)) {
            return res.status(403);
        }
        var user = decoded;
        var accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });
    });
});
app.delete("/logout", function (req, res) {
    refreshTokens = refreshTokens.filter(function (token) { return token !== req.body.token; });
    res.sendStatus(204);
});
app.post("/login", function (req, res) {
    // Authenticate
    var username = req.body.username;
    var user = {
        name: username,
    };
    var accessToken = generateAccessToken(user);
    var refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });
}
var posts = [];
app.get("/posts", authenticateToken, function (req, res) {
    res.json(posts.filter(function (post) { return post.username === req.user.name; }));
});
function authenticateToken(req, res, next) {
    var authHeader = req.headers["authorization"];
    var token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}
