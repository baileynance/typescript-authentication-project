import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const express = require("express");
const app = express();

app.use(express.json());

interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

type Post = {
    username: string;
    title: string;
};
  
const posts: Post[] = [
    {
        username: "Bailey",
        title: "Test"
    },
    {
        username: "Isabella",
        title: "Test 2"
    }
];

app.get("/posts", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json(posts.filter(post => post.username === (req.user as any).name));
})

app.post("/login", (req: Request, res:Response) => {
    // Authenticate

    const username: string = req.body.username;

    type User = {
        name: string;
    }

    const user: User = {
        name: username
    }

    const accessToken: string = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string);

    res.json({ accessToken })
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

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});