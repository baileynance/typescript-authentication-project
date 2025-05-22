import * as http from "http";
import * as fs from "fs"
import { IncomingMessage, ServerResponse } from "http";
import * as dotenv from "dotenv";
dotenv.config();

const express = require("express");
const app = express();

app.set("view-engine", "ejs")

app.use(express.json());

// Create Server

const port = 3000;

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/ejs" })
    fs.readFile("./views/index.ejs", function(error, data) {
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

import * as testRouter from "./routes/test.js";

app.use("/test", testRouter)
