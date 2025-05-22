import * as http from "http";
import * as fs from "fs"
import { IncomingMessage, ServerResponse } from "http";

import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const express = require("express");
const app = express();

app.use(express.json());

interface UserPayload {
    name: string;
}

interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

// Create Server

const port = 3000;

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/html" })
    fs.readFile("index.html", function(error, data) {
        if (error) {
            res.writeHead(404)
            res.write("Error: File Not Found")
        } else {
            res.write(data);
        }
        res.end();
    })
});

server.listen(port, (error?: Error) => {
    if (error) {
        console.log("Something went wrong", error);
    } else {
        console.log(`Server is listening on port ${port}`);
    }
});


// Authenticate

let refreshTokens: string[] = []

app.post("/token", (req: Request, res:Response) => {
    const refreshToken: string = req.body.token
    if (refreshTokens == null) {
        return res.status(401)
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403)
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err, decoded) => {
        if (err || typeof decoded !== 'object' || !decoded || !('name' in decoded)) {
            return res.status(403)
        }
        const user = decoded as UserPayload;
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

app.delete("/logout", (req: Request, res: Response) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post("/login", (req: Request, res:Response) => {
    // Authenticate

    const username: string = req.body.username;

    const user: UserPayload = {
        name: username,
    };

    const accessToken: string = generateAccessToken(user);
    const refreshToken: string = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string)
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user: UserPayload) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "20s" });
}

// Login

type Post = {
    username: string;
    title: string;
};
  
let posts: Post[] = [];

app.get("/posts", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json(posts.filter(post => post.username === (req.user as any).name));
})


function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user;
        next();
    })
}