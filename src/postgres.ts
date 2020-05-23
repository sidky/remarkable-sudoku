import {Client} from "pg";
import {logger} from "./logger";
import hash from "object-hash";

const client = new Client({
    connectionString: process.env.DATABASE_URL
});
client.connect();

export async function getToken(): Promise<string | undefined>{
    const result = await client.query("SELECT token FROM remarkable_config LIMIT 1");
    if (result.rows.length === 0) {
        return undefined;
    } else {
        return result.rows[0].token;
    }
}

export async function setToken(deviceId: string, token: string): Promise<boolean> {
    const result = await client.query("INSERT INTO remarkable_config(device_id, token) VALUES($1, $2)", [deviceId, token]);
    return true;
}

export async function hasShownBefore(board: number[][]): Promise<boolean> {
    const h = boardHash(board);

    const result = await client.query("SELECT COUNT(*) AS c FROM sudoku_hash WHERE md5 = $1", [h]);

    const count: number = parseInt(result.rows[0].c, 10);

    return count !== 0;
}

export async function setShown(board: number[][]): Promise<boolean> {
    const h = boardHash(board);

    const result = await client.query("INSERT INTO sudoku_hash(md5) VALUES($1)", [h]);

    return true;
}

function boardHash(board: number[][]): string {
    return hash.MD5(board);
}