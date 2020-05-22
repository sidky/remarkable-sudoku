import puppeteer from "puppeteer";
import { logger } from "./logger";

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
                // logger.info(v);
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

        logger.info(this.board);

        await browser.close();
    }
}