"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var router = express.Router();
router.use(express.json());
var posts = [];
router.get("/", function (req, res) {
    res.render("login");
});
router.get("/posts", authenticateToken, function (req, res) {
    res.json(posts.filter(function (post) { return post.username === req.user.name; }));
});
router.post("/login", function (req, res) {
    // Authenticate
    var username = req.body.username;
    var user = {
        name: username
    };
    var accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
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
module.exports = router;
