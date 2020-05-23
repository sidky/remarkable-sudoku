import puppeteer from "puppeteer";
import { logger } from "./logger";
import { Remarkable } from "remarkable-typescript";
import ejs from "ejs";
import { hasShownBefore, setShown } from "./postgres";

export class SudokuGenerator {
    board: number[][];

    constructor() {
        this.board = [];
    }

    async parseNYTimes(url: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const selector = "div.su-board";

        await page.waitForSelector("div.su-board");

        logger.info(`Parsing: ${url}`);

        const numbers: number[] = await page.$eval<number[]>(selector, () => {
            const divboard = document.querySelector("div.su-board");

            const items: number[] = [];

            divboard?.querySelectorAll("div.su-cell").forEach((v, key, parent) => {
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

        const parsedBoard: number[][] = [];

        for (let i = 0; i < 9; i++) {
            const row: number[] = [];

            for (let j = 0; j < 9; j++) {
                row.push(numbers[i * 9 + j]);
            }
            parsedBoard.push(row);
        }

        this.board = parsedBoard;

        logger.info(`Parsed: ${this.board}`);

        await browser.close();
    }

    async uploadPDF(name: string, client: Remarkable) {
        logger.info(`Uploading: ${this.board}`);
        const shown = await hasShownBefore(this.board);
        logger.info(`Shown: ${shown}`);
        if (shown) {
            logger.info(`Board ${this.board} was already shown before`);
            return;
        }
        logger.info("Generating");
        const content = await ejs.renderFile(`${__dirname}/views/sudoku.ejs`, {
            "title": name,
            "board": this.board
        });

        logger.info(`New page for ${name}: ${content}`);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(content, {waitUntil: "domcontentloaded"});

        const buffer = await page.pdf({
            format: 'A4'
        });
        browser.close();
        await client.refreshToken();
        const resp = await client.uploadPDF(name, buffer);

        await setShown(this.board);

        return true;
    }
}