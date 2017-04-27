export { lands as lands } from "./lands";
export { default as hako } from "./settings";
export interface Island {
    name: string;
    id: number;
    prize: any; // TBD
    absent: number;
    comment: string;
    password: string;
    money: number;
    food: number;
    pop: number;
    area: number;
    farm: number;
    factory: number;
    mountain: number;
    score: number;
    lands: Land[][];
    commands: Command[];
    bbs: string[];
}
interface Land {
    land: number;
    value: number;
}
interface Command {
    kind: number;
    target: number;
    x: number;
    y: number;
    arg: number;
}
export interface NewIslandArg {
    islandNumber: number;
    name: string;
    password: string;
    islands: Island[];
}