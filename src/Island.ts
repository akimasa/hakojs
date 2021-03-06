export enum lands {
    Sea,
    Waste,
    Plains,
    Town,
    Forest,
    Farm,
    Factory,
    Base,
    Defence,
    Mountain,
    Monster,
    Sbase,
    Oil,
    Monument,
    Haribote,
}
export interface Land {
    kind: lands;
    value: number;
}
export interface Command {
    kind: number;
    target: number;
    x: number;
    y: number;
    arg: number;
}
export class Island {
    public name: string;
    public id: number;
    public prize: any; // TBD
    public absent: number;
    public comment: string;
    public password: string;
    public money: number;
    public food: number;
    public pop: number;
    public area: number;
    public farm: number;
    public factory: number;
    public mountain: number;
    public score: number;
    public lands: Land[][];
    public commands: Command[];
    public bbs: string[];
    constructor() {
        this.name = "";
        this.id = -1;
        this.prize = "";
        this.absent = -1;
        this.comment = "";
        this.password = "";
        this.money = -1;
        this.food = -1;
        this.pop = -1;
        this.area = -1;
        this.farm = -1;
        this.factory = -1;
        this.mountain = -1;
        this.score = -1;
        this.lands = [[]];
        this.commands = [];
        this.bbs = [];
    }
}
export interface CamouflagedIsland {
    name: string;
    id: number;
    prize: any; // TBD
    absent: number;
    comment: string;
    money: number;
    food: number;
    pop: number;
    area: number;
    farm: number;
    factory: number;
    mountain: number;
    score: number;
    lands: Land[][];
    bbs: string[];
}