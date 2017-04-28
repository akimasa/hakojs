export { lands as lands } from "./lands";
export { default as hako } from "./settings";
export { default as Hakojima } from "./Hakojima";
export { default as Island } from "./Island";
export { Land as Land } from "./Island";
import * as crypto from "crypto";
import Island from "./Island";
import settings from "./settings";

export function encodepass(pass: string) {
    const salt = crypto.pseudoRandomBytes(16);
    const key = crypto.pbkdf2Sync(pass, salt, settings.passwordIterations, 128, "sha512");
    return salt.toString("base64") + ":" + key.toString("base64");
}
export function checkPassword(saved: string, input: string) {
    if (input === "") {
        return false;
    }
    if (input === settings.masterPassword) {
        return true;
    }
    const parts = saved.split(":");
    const salt = new Buffer(parts[0], "base64");
    const key = crypto.pbkdf2Sync(input, salt, settings.passwordIterations, 128, "sha512");
    if (parts[1] === key.toString("base64")) {
        return true;
    }
    return false;
}