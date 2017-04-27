interface ICommandElement {
    name: string;
    const: number;
    id: number;
}
interface ISettings {
    unitTime: number;
    maxIsland: number;
    logMax: number;
    giveupTurn: number;
    commandMax: number;
    islandSize: number;
    com: ICommandElement[];
    comFromId(id: number): ICommandElement;
}
declare module "*settings.json"{
    const value: ISettings;
    export default value;
}