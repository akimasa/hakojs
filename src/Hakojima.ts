import HakoTurn from "./HakoTurn";
import {NewIslandArg as NewIslandArg } from "./HakoTurn";
import Island from "./Island";
import { Land as Land } from "./Island";

export default class Hakojima implements HakoTurn {
    public nextId: number;
    public islandLastTime: number;
    public islandTurn: number;
    public islands: Island[];
    public turnMain: () => void;
    public newIslandMain: (arg: NewIslandArg) => string;

    constructor(json: {
        nextId: number,
        islandLastTime: number,
        islandTurn: number,
        islands: Island[],
    }) {
        this.nextId = json.nextId - 1;
        this.islandLastTime = json.islandLastTime;
        this.islandTurn = json.islandTurn;
        this.islands = json.islands;
        for (const island of this.islands) {
            if (island.id > this.nextId) {
                this.nextId = island.id;
            }
        }
        this.nextId++;
    }
}
applyMixins(Hakojima, [HakoTurn]);
////////////////////////////////////////
// In your runtime library somewhere
////////////////////////////////////////

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}