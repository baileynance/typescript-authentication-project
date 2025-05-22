import * as express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.render("./views/test.html");
});

export default router;