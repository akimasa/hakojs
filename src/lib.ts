export { lands as lands } from "./lands";
export { default as hako } from "./settings";
interface Island {
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
}
interface Islands {
    islands: Island[];
}
interface NewIslandArg {
    islandNumber: number;
    name: string;
    password: string;
    islands: Islands;
}