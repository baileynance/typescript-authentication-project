"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var app = express();
app.use(express.json());
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
app.listen(4000, function () {
    console.log("Server running on http://localhost:4000");
});
