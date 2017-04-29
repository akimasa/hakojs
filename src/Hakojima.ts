import Island from "./Island";
export default class Hakojima {
    public nextId: number;
    public islandLastTime: number;
    public islandTurn: number;
    public islands: Island[];
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