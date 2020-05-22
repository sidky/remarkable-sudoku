import express from "express";
import path from "path";
import puppeteer from "puppeteer";
import {logger} from "./logger";
import {SudokuGenerator} from "./sudoku";

const myfunc = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.nytimes.com/puzzles/sudoku/easy", {waitUntil: 'networkidle2'});

    const selector = "div.su-board";

    await page.waitForSelector("div.su-board");

    logger.info("--begin--");
    // console.log(page);

    // const b = await page.evaluate(() => {
    //     return document.body.innerHTML;
    // });

    // console.log(b);

    const numbers: number[] = await page.$eval<number[]>(selector, () => {
        const divboard = document.querySelector("div.su-board");

        const items: number[] = [];

        divboard?.querySelectorAll("div.su-cell").forEach((v, key, parent) => {
            logger.info(v);
            const svg = v.querySelector("svg");
            const value = svg?.attributes.getNamedItem("number")?.textContent;

            if (value != null) {
                items.push(parseInt(value, 10));
            } else {
                items.push(-1);
            }
        });

        return items;
    });

    const board: number[][] = [];

    for (let i = 0; i < 9; i++) {
        const row: number[] = [];

        for (let j = 0; j < 9; j++) {
            row.push(numbers[i * 9 + j]);
        }
        board.push(row);
    }

    logger.info(board);

    // await page.evaluate((selector) => {
    //     console.log("Start,..");
    //     const html = document.querySelector(selector).innerHTML;

    //     console.log(html);
    // });

    await browser.close();
};

// myfunc();

const app = express();
const port = process.env.PORT || 8080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/sudoku/nytimes", async (req, res) => {
    const generator = new SudokuGenerator();
    await generator.parseNYTimes("https://www.nytimes.com/puzzles/sudoku/easy");
    res.render("sudoku", {board: generator.board});
});

app.listen(port, () => {
    logger.info(`server started at port: ${port}`);
});