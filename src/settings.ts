interface CommandElement {
    name: string;
    const: number;
    id: number;
}
interface Settings {
    masterPassword: string;
    passwordIterations: number;
    unitTime: number;
    maxIsland: number;
    logMax: number;
    giveupTurn: number;
    commandMax: number;
    islandSize: number;
    hideMoneyMode: number;
    debug: number;
    initialMoney: number;
    initialFood: number;
    unitMoney: string;
    unitFood: string;
    unitPop: string;
    unitArea: string;
    unitTree: string;
    treeValue: number;
    costChangeName: number;
    eatenFood: number;
    maxExpPoint: number;
    baseLevelUp: number[];
    sBaseLevelUp: number[];
    dBaseAuto: number;
    disEarthquake: number;
    disTsunami: number;
    disTyphoon: number;
    disMeteo: number;
    disHugeMeteo: number;
    disEruption: number;
    disFire: number;
    disMaizo: number;
    disFallBorder: number;
    disFalldown: number;
    monsterLevel: number[];
    monsterName: string[];
    monsterBHP: number[];
    monsterDHP: number[];
    monsterSpecial: number[];
    monsterExp: number[];
    monsterValue: number[];
    monsterImage: string[];
    monsterImage2: string[];
    oilMoney: number;
    oilRatio: number;
    monumentName: string[];
    monumentImage: string[];
    turnPrizeUnit: number;
    prize: string[];
    landSea: number;
    landWaste: number;
    landPlains: number;
    landTown: number;
    landForest: number;
    landFarm: number;
    landFactory: number;
    landBase: number;
    landDefence: number;
    landMountain: number;
    landMonster: number;
    landSbase: number;
    landOil: number;
    landMonument: number;
    landHaribote: number;
    com: CommandElement[];
    comFromId(id: number): CommandElement;
}
const settings: Settings = require("../settings.json");
settings.comFromId = (id) => {
    for (const ele in settings.com) {
        if (settings.com[ele].id === id) {
            return settings.com[ele];
        }
    }
};
export default settings;