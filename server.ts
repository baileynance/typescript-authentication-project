// Imports needed for authentication and server setup
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";        // For handling JWT creation and verification
import * as dotenv from "dotenv";           // For loading environment variables
dotenv.config();                            // Load variables from .env file into process.env

// CommonJS require for express (though you're mixing `import` and `require`, which isn't ideal)
const express = require("express");
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Extend the Express Request interface to include an optional 'user' property for authenticated users
interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

// Define a Post type for storing post data
type Post = {
    username: string;
    title: string;
};

// Sample posts data (in-memory, not persistent)
let posts: Post[] = [];

// Protected route to fetch posts created by the authenticated user
app.get("/posts", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    // Filter posts by username that matches the authenticated user's name
    res.json(posts.filter(post => post.username === (req.user as any).name));
});

// Public route to log in and receive a JWT access token
app.post("/login", (req: Request, res: Response) => {
    // NOTE: This is a mock authentication—there’s no password checking here.

    const username: string = req.body.username;

    // Create a user object to be encoded into the JWT
    type User = {
        name: string;
    }

    const user: User = {
        name: username
    }

    // Sign the JWT with a secret key stored in the environment variables
    const accessToken: string = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string);

    // Send the token back to the client
    res.json({ accessToken: accessToken });
});

// Middleware function to authenticate incoming requests using a JWT
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Extract the token from the Authorization header (format: "Bearer <token>")
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // If there's no token, return 401 Unauthorized
    if (token == null) {
        return res.sendStatus(401);
    }

    // Verify the token using the secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
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
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
