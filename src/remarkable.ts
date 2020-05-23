import {Remarkable} from "remarkable-typescript";
import { getToken, setToken } from "./postgres";
import { logger } from "./logger";
import { v4 as uuid4} from "uuid";

export class RemarkableUtil {
    client: Remarkable | undefined;

    async initialize(): Promise<boolean> {
        const token = await getToken();
        if (token === undefined) {
            return false;
        } else {
            this.client = new Remarkable({
                deviceToken: token
            });
            return true;
        }
    }

    async register(c: string): Promise<boolean> {
        this.client = new Remarkable();
        const deviceId = uuid4();
        const token = await this.client?.register({
            code: c,
            deviceDesc: 'desktop-windows',
            deviceId
        });
        await setToken(deviceId, token);
        return true;
    }
}