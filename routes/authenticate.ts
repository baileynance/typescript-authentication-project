import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const express = require("express");
const router = express.Router();
router.use(express.json());

router.get("/", (req: Request, res: Response) => {
    res.send("Authenticate");
});

interface UserPayload {
    name: string;
}

let refreshTokens: string[] = []

router.post("/token", (req: Request, res:Response) => {
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

router.delete("/logout", (req: Request, res: Response) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

router.post("/login", (req: Request, res:Response) => {
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

module.exports = router;