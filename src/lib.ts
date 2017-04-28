export { lands as lands } from "./lands";
export { default as hako } from "./settings";
export { default as Hakojima } from "./Hakojima";
export { default as Island } from "./Island";
export { Land as Land } from "./Island";
import Island from "./Island";
export interface NewIslandArg {
    name: string;
    password: string;
    password2: string;
    islands: Island[];
    nextId: number;
}

export function encodepass(pass: string) {
    return "hogehoge";
}