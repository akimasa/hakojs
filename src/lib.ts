import * as crypto from "crypto";
import settings from "./settings";

export function encodepass(pass: string) {
    const salt = crypto.pseudoRandomBytes(16);
    const key = crypto.pbkdf2Sync(pass, salt, settings.passwordIterations, 128, "sha512");
    return salt.toString("base64") + ":" + key.toString("base64");
}
export function checkPassword(saved: string, input: string): Promise<void|{}> {
    if (input === "" || input === undefined || input === null) {
        return Promise.reject("blank pssword input");
    }
    if (input === settings.masterPassword) {
        return Promise.resolve();
    }
    const parts = saved.split(":");
    const salt = new Buffer(parts[0], "base64");
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(input, salt, settings.passwordIterations, 128, "sha512", (err, derivedKey) => {
            if (err || parts[1] !== derivedKey.toString("base64")) {
                reject("password check failed");
            } else {
                resolve();
            }
        });

    });
}