"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
// Creating instances of module classes to use 
var express = require("express");
var app = express();
app.use(express.json());
// Empty array with string type to hold history of refresh tokens
var refreshTokens = [];
// Will be used to create a new refresh token so that the user will be allowed to continue access
app.post("/token", function (req, res) {
    var refreshToken = req.body.token;
    // Check if there were any previous refresh tokens stored and if so send back a 401 status response
    if (refreshTokens == null) {
        return res.status(401);
    }
    // Check if any of the previous refresh tokens match the newly created one and if so send back a 403 status response
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403);
    }
    // Verify the refresh token as a valid token and check for errors
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function (err, decoded) {
        // Check if the decoded value matches the expected type or is null, if so send back 403 status response
        if (err || typeof decoded !== 'object' || !decoded || !('name' in decoded)) {
            return res.status(403);
        }
        // User jwt defined as UserPayload which is expected to be a string
        var user = decoded;
        // Generate a new access token to allow for continued access
        var accessToken = generateAccessToken({ name: user.name });
        // Set access token and send as response
        res.json({ accessToken: accessToken });
    });
});
// Delete token so that it is no longer valid
app.delete("/logout", function (req, res) {
    // If the current token is in the list of valid tokens, remove it and send 204 status response
    refreshTokens = refreshTokens.filter(function (token) { return token !== req.body.token; });
    res.sendStatus(204);
});
app.post("/login", function (req, res) {
    // Set the body of the request with username key to a variable username expecting type string
    var username = req.body.username;
    // Username object will expect a string type
    var user = {
        name: username,
    };
    // Generate a new access token
    var accessToken = generateAccessToken(user);
    // Generate a refresh token
    var refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    // Send copy of refresh token to list 
    refreshTokens.push(refreshToken);
    // Send response of both tokens back
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});
// Function to generate new access token
function generateAccessToken(user) {
    // Sets the the JWT to expire after 20s so that access will be forbidden
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });
}
// Server will be running on port 4000
app.listen(4000, function () {
    console.log("Server running on http://localhost:4000");
});
