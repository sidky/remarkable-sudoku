import express from "express";
import path from "path";
import {logger} from "./logger";
import {SudokuGenerator} from "./sudoku";
import { RemarkableUtil } from "./remarkable";
import bodyParser from "body-parser";
import { Remarkable } from "remarkable-typescript";

const urls: {[index: string]: string} = {
    'Easy': 'https://www.nytimes.com/puzzles/sudoku/easy',
    'Medium': 'https://www.nytimes.com/puzzles/sudoku/medium',
    'Hard': 'https://www.nytimes.com/puzzles/sudoku/hard'
};

const app = express();
const port = process.env.PORT || 8080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/sudoku/sample/nytimes", async (req, res) => {
    const generator = new SudokuGenerator();
    await generator.parseNYTimes("https://www.nytimes.com/puzzles/sudoku/easy");
    res.render("sudoku", {board: generator.board});
});

app.get("/sudoku/generate", async (req, res) => {
    const secret = req.query.secret;

    if (secret !== process.env.SECRET) {
        logger.error(`Invalid secret: ${secret}`);
        res.status(403).send({
            'error': 'Secrets did not match'
        });
        return;
    }
    const arg = req.body;
    logger.info(arg);

    const util = new RemarkableUtil();
    const initialized = await util.initialize();

    if (!initialized) {
        res.status(401).send({
            'error': 'Can not initialize. Have you registered the client yet?'
        });
        return;
    }

    const client = util.client;
    client?.refreshToken();

    for (const t of Object.keys(urls)) {
        const generator = new SudokuGenerator();
        const url = urls[t];
        await generator.parseNYTimes(urls[t] as string);
        await generator.uploadPDF(t, util.client as Remarkable);
    }

    res.send({
        "success": "ok"
    });
});

app.post("/remarkable/register", async (req, res) => {
    logger.info(req.body.token);
    const remarkable = new RemarkableUtil();
    await remarkable.register(req.body.token);
    res.send({'done': 'true'});
});


app.listen(port, () => {
    logger.info(`server started at port: ${port}`);
});