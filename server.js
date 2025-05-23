"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jsonwebtoken"); // For handling JWT creation and verification
var dotenv = require("dotenv"); // For loading environment variables
dotenv.config(); // Load variables from .env file into process.env
// CommonJS require for express (though you're mixing `import` and `require`, which isn't ideal)
var express = require("express");
var app = express();
// Middleware to parse incoming JSON requests
app.use(express.json());
// Sample posts data (in-memory, not persistent)
var posts = [];
// Protected route to fetch posts created by the authenticated user
app.get("/posts", authenticateToken, function (req, res) {
    // Filter posts by username that matches the authenticated user's name
    res.json(posts.filter(function (post) { return post.username === req.user.name; }));
});
// Public route to log in and receive a JWT access token
app.post("/login", function (req, res) {
    // NOTE: This is a mock authentication—there’s no password checking here.
    var username = req.body.username;
    var user = {
        name: username
    };
    // Sign the JWT with a secret key stored in the environment variables
    var accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    // Send the token back to the client
    res.json({ accessToken: accessToken });
});
// Middleware function to authenticate incoming requests using a JWT
function authenticateToken(req, res, next) {
    // Extract the token from the Authorization header (format: "Bearer <token>")
    var authHeader = req.headers["authorization"];
    var token = authHeader && authHeader.split(" ")[1];
    // If there's no token, return 401 Unauthorized
    if (token == null) {
        return res.sendStatus(401);
    }
    // Verify the token using the secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
        // If verification fails, return 403 Forbidden
        if (err) {
            return res.sendStatus(403);
        }
        // Save the decoded user info to the request object
        req.user = user;
        // Proceed to the next middleware or route handler
        next();
    });
}
// Start the Express server on port 3000
app.listen(3000, function () {
    console.log("Server running on http://localhost:3000");
});
