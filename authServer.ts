// Imports needed for authentication file
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

// Creating instances of module classes to use 
const express = require("express");
const app = express();
app.use(express.json());

// Define the type of a user with a JWT payload to be a string
interface UserPayload {
    name: string;
}

// Empty array with string type to hold history of refresh tokens
let refreshTokens: string[] = []

// Will be used to create a new refresh token so that the user will be allowed to continue access
app.post("/token", (req: Request, res:Response) => {
    const refreshToken: string = req.body.token
    // Check if there were any previous refresh tokens stored and if so send back a 401 status response
    if (refreshTokens == null) {
        return res.status(401)
    }
    // Check if any of the previous refresh tokens match the newly created one and if so send back a 403 status response
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403)
    }
    // Verify the refresh token as a valid token and check for errors
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err, decoded) => {
        // Check if the decoded value matches the expected type or is null, if so send back 403 status response
        if (err || typeof decoded !== 'object' || !decoded || !('name' in decoded)) {
            return res.status(403)
        }
        // User jwt defined as UserPayload which is expected to be a string
        const user = decoded as UserPayload;
        // Generate a new access token to allow for continued access
        const accessToken = generateAccessToken({ name: user.name })
        // Set access token and send as response
        res.json({ accessToken: accessToken })
    })
})

// Delete token so that it is no longer valid
app.delete("/logout", (req: Request, res: Response) => {
    // If the current token is in the list of valid tokens, remove it and send 204 status response
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post("/login", (req: Request, res:Response) => {
    
    // Set the body of the request with username key to a variable username expecting type string
    const username: string = req.body.username;

    // Username object will expect a string type
    const user: UserPayload = {
        name: username,
    };

    // Generate a new access token
    const accessToken: string = generateAccessToken(user);
    // Generate a refresh token
    const refreshToken: string = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string)
    // Send copy of refresh token to list 
    refreshTokens.push(refreshToken)
    // Send response of both tokens back
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

// Function to generate new access token
function generateAccessToken(user: UserPayload) {
    // Sets the the JWT to expire after 20s so that access will be forbidden
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "20s" });
}

// Server will be running on port 4000
app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});