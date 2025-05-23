import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
dotenv.config();
const express = require("express");
const router = express.Router();
router.use(express.json());

interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

type Account = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

let accounts: Account[] = [];

async function loadAccounts() {
    const data = await fs.readFile("./data/accounts.json", "utf-8");
    accounts = JSON.parse(data);
}

loadAccounts().catch(err => {
    console.error("Failed to load accounts:", err);
});

router.get("/", (req: Request, res: Response) => {
    res.render("login")
})

router.get("/accounts", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json(accounts.filter(account => account.firstName === (req.user as any).name));
})

router.post("/", (req: Request, res:Response) => {
    // Authenticate

    const username: string = req.body.username;

    type User = {
        name: string;
    }

    const user: User = {
        name: username
    }

    const accessToken: string = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string);

    res.json({ accessToken: accessToken })
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

module.exports = router;