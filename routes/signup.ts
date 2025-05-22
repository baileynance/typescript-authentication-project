import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
dotenv.config();
const express = require("express");
const router = express.Router();
router.use(express.json());

interface User {
    firstName: string;
    lastName: string;
    username: string
    email: string;
    password: string;
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
    res.render("signup")
})

router.post("/", (req: Request, res:Response) => {

    const user = { firstName: req.body.firstName, lastName: req.body.lastName, username: req.body.username, email: req.body.email, password: req.body.password };

    accounts.push(user)

    res.status(201).send("User created successfully!");
})

module.exports = router;