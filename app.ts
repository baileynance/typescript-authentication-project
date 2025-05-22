import * as dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
dotenv.config();

const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;

app.set("view engine", "ejs")

app.get("/", (req: Request, res: Response) => {
    res.render("index")
})

const authenticateRouter = require("./routes/authenticate.js");
app.use("/auth", authenticateRouter)

app.listen(port, (error?: Error) => {
    if (error) {
        console.log("Something went wrong", error);
    } else {
        console.log(`Server is listening on port ${port}`);
    }
});


