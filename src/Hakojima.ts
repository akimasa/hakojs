import coms from "./coms";
import * as Island from "./Island";
import * as lib from "./lib";
import Log from "./Log";
import settings from "./settings";
export interface NewIslandArg {
    name: string;
    password: string;
    password2: string;
}
interface IslandMemo {
    bigmissile: number;
    propaganda: number;
    dead: number;
    oldPop: number;
}
interface IslandMemoArray {
    [index: number]: IslandMemo;
}
export default class Hakojima {
    public nextId: number;
    public islandLastTime: number;
    public islandTurn: number;
    public islands: Island.Island[];
    public logData: Log;
    private islandMemo: IslandMemoArray;
    private ax = [0, 1, 1, 1, 0, -1, 0, 1, 2, 2, 2, 1, 0, -1, -1, -2, -1, -1, 0];
    private ay = [0, -1, 0, 1, 1, 0, -1, -2, -1, 0, 1, 2, 2, 2, 1, 0, -1, -2, -2];
    constructor() {
        this.nextId = 1;
        this.islandLastTime = new Date().getTime();
        this.islandLastTime = this.islandLastTime - (this.islandLastTime % (settings.unitTime * 1000));
        this.islandTurn = 1;
        this.islands = [];
        this.islandMemo = [];
        this.logData = new Log();
    }
    public load(jsonstr: string) {
        const json = JSON.parse(jsonstr);
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
    public getJSON() {
        if (!settings.debug) {
            return;
        }
        return JSON.stringify(this.getData());
    }
    public getSummary() {
        return {
            nextId: this.nextId,
            islandLastTime: this.islandLastTime,
            islandTurn: this.islandTurn,
            islands: this.getIslandsCamouflagedSummary(),
            settings: {
                unitArea: settings.unitArea,
                unitFood: settings.unitFood,
                unitMoney: settings.unitMoney,
                unitPop: settings.unitPop,
                unitTime: settings.unitTime,
                unitTree: settings.unitTree,
                costChangeName: settings.costChangeName,
                baseLevelUp: settings.baseLevelUp,
                maxIsland: settings.maxIsland,
                monsterImage: settings.monsterImage,
                monsterImage2: settings.monsterImage2,
                monsterName: settings.monsterName,
                monumentImage: settings.monumentImage,
                monumentName: settings.monumentName,
                islandSize: settings.islandSize,
                commandMax: settings.commandMax,
                debug: settings.debug,
            },
        };
    }
    public debugButton() {
        if (settings.debug) {
            this.turnMain();
            return true;
        } else {
            return false;
        }
    }
    public getIsland(id: number) {
        return this.islands.find((ele) => ele.id === id);
    }
    public getCamouflagedIsland(id: number): Island.CamouflagedIsland {
        const island = this.getIsland(id);
        if (island === undefined) {
            return undefined;
        }
        return {
            name: island.name,
            id: island.id,
            prize: island.prize,
            absent: island.absent,
            comment: island.comment,
            money: island.money,
            pop: island.pop,
            food: island.food,
            area: island.area,
            farm: island.farm,
            factory: island.factory,
            mountain: island.mountain,
            score: island.score,
            lands: this.camouflageLands(island.lands),
            bbs: island.bbs,
        };
    }
    public getIslandNames() {
        const ret = [];
        for (const island of this.islands) {
            ret.push({id: island.id, name: island.name});
        }
        return ret;
    }
    public authIsland(id: number, input: string): boolean {
        return lib.checkPassword(this.getIsland(id).password, input);
    }
    public newIslandMain(arg: NewIslandArg) {
        if (this.islands.length >= settings.maxIsland) {
            return "申し訳ありません、島が一杯で登録できません！！";
        }
        if (arg.name === "" || arg.name === undefined) {
            return "島につける名前が必要です。";
        }
        if (/[,\?\(\)\<\>]|^無人$/.test(arg.name)) {
            return "',?()<>\$'とか入ってたり、「無人島」とかいった変な名前はやめましょうよ〜";
        }
        for (const island of this.islands) {
            if (island.name === arg.name) {
                return "その島ならすでに発見されています。";
            }
        }
        if (arg.password === "" || arg.password === undefined) {
            return "パスワードが必要です。";
        }
        if (arg.password !== arg.password2) {
            return "パスワードが違います。";
        }
        const island = new Island.Island();
        island.lands = this.makeNewLand();
        island.name = arg.name;
        island.id = this.nextId;
        this.nextId++;
        island.absent = settings.giveupTurn - 3;
        island.comment = "(未登録)";
        island.password = lib.encodepass(arg.password);
        island.money = settings.initialMoney;
        island.food = settings.initialFood;
        for (let i = 0; i < settings.commandMax; i++) {
            island.commands[i] = {
                kind: coms.coms.donothing.id,
                target: 0,
                x: 0,
                y: 0,
                arg: 0,
            };
        }
        const index = this.islands.push(island);
        this.estimate(index - 1);
        return island.id;
    }
    public turnMain() {
        // 最終更新時間を更新
        this.islandLastTime += settings.unitTime * 1000;

        // ターン番号
        this.islandTurn++;

        // 順番決め
        const order = this.randomArray(this.islands.length);

        // islandMemoをリセット
        this.islandMemo = [];
        // 収入、消費フェイズ
        for (let i = 0; i < this.islands.length; i++) {
            this.estimate(order[i]);
            this.income(this.islands[order[i]]);
            // 各島のislandMemoを初期化
            this.islandMemo[order[i]] = {bigmissile: 0, propaganda: 0, oldPop: 0, dead: 0};
            // ターン開始前の人口をメモる
            this.islandMemo[order[i]].oldPop = this.islands[order[i]].pop;
        }

        // コマンド処理
        for (let i = 0; i < this.islands.length; i++) {
            while (1) {
                if (this.doCommand(order[i]) !== 0) {
                    break;
                }
            }
        }

    }
    private camouflageLands(rawLands: Island.Land[][]): Island.Land[][] {
        const camouflagedLands: Island.Land[][] = [[]];
        for (let x = 0; x < settings.islandSize; x++) {
            camouflagedLands[x] = [];
            for (let y = 0; y < settings.islandSize; y++) {
                camouflagedLands[x][y] = {kind: rawLands[x][y].kind, value: rawLands[x][y].value};
                if (camouflagedLands[x][y].kind === Island.lands.Base
                || camouflagedLands[x][y].kind === Island.lands.Sbase) {
                    camouflagedLands[x][y].value = 0;
                }
                if (camouflagedLands[x][y].kind === Island.lands.Base) {
                    camouflagedLands[x][y].kind = Island.lands.Forest;
                }
                if (camouflagedLands[x][y].kind === Island.lands.Forest) {
                    camouflagedLands[x][y].value = 0;
                }
                if (camouflagedLands[x][y].kind === Island.lands.Sbase) {
                    camouflagedLands[x][y].kind = Island.lands.Sea;
                }
            }
        }
        return camouflagedLands;
    }
    private getIslandsCamouflagedSummary(): Island.Island[] {
        const islands = [];
        for (const island of this.islands) {
            islands.push({
                name: island.name,
                id: island.id,
                prize: island.prize,
                absent: island.absent,
                comment: island.comment,
                money: island.money,
                food: island.food,
                pop: island.pop,
                area: island.area,
                farm: island.farm,
                factory: island.factory,
                mountain: island.mountain,
            });
        }
        return islands;
    }
    private getData() {
        return {
            nextId: this.nextId,
            islandLastTime: this.islandLastTime,
            islandTurn: this.islandTurn,
            islands: this.islands,
            logData: this.logData.getLog(),
        };
    }
    private makeNewLand(): Island.Land[][] {
        const land: Island.Land[][] = [];

        for (let x = 0; x < settings.islandSize; x++) {
            land[x] = [];
            for (let y = 0; y < settings.islandSize; y++) {
                land[x][y] = { kind: Island.lands.Sea, value: 0 };
            }
        }
        const center = settings.islandSize / 2 - 1;
        for (let y = center - 1; y < center + 3; y++) {
            for (let x = center - 1; x < center + 3; x++) {
                land[x][y].kind = Island.lands.Waste;
            }
        }

        // 8*8範囲内に陸地を増殖
        for (let i = 0; i < 120; i++) {
            const x = this.random(8) + center - 3;
            const y = this.random(8) + center - 3;

            if (this.countAround(land, x, y, Island.lands.Sea, 7) !== 7) {
                // 周りに陸地がある場合、浅瀬にする
                // 浅瀬は荒地にする
                // 荒地は平地にする
                if (land[x][y].kind === Island.lands.Waste) {
                    land[x][y].kind = Island.lands.Plains;
                    land[x][y].value = 0;
                } else {
                    if (land[x][y].value === 1) {
                        land[x][y].kind = Island.lands.Waste;
                        land[x][y].value = 0;
                    } else {
                        land[x][y].value = 1;
                    }
                }
            }
        }

        // 森を作る
        let count = 0;
        while (count < 4) {
            const x = this.random(4) + center - 1;
            const y = this.random(4) + center - 1;

            // そこがすでに森でなければ、森を作る
            if (land[x][y].kind !== Island.lands.Forest) {
                land[x][y].kind = Island.lands.Forest;
                land[x][y].value = 5;
                count++;
            }
        }

        // 町を作る
        count = 0;
        while (count < 2) {
            const x = this.random(4) + center - 1;
            const y = this.random(4) + center - 1;

            if ((land[x][y].kind !== Island.lands.Town) &&
                (land[x][y].kind !== Island.lands.Forest)) {
                land[x][y].kind = Island.lands.Town;
                land[x][y].value = 5;
                count++;
            }
        }

        // 山を作る
        count = 0;
        while (count < 1) {
            const x = this.random(4) + center - 1;
            const y = this.random(4) + center - 1;

            if ((land[x][y].kind !== Island.lands.Town) &&
                (land[x][y].kind !== Island.lands.Forest)) {
                land[x][y].kind = Island.lands.Mountain;
                land[x][y].value = 0;
                count++;
            }
        }

        // 基地を作る
        count = 0;
        while (count < 2) {
            const x = this.random(4) + center - 1;
            const y = this.random(4) + center - 1;

            if ((land[x][y].kind !== Island.lands.Town) &&
                (land[x][y].kind !== Island.lands.Forest) &&
                (land[x][y].kind !== Island.lands.Mountain)) {
                land[x][y].kind = Island.lands.Base;
                land[x][y].value = 0;
                count++;
            }
        }
        return land;
    }
    private countAround(land: Island.Land[][], x: number, y: number, kind: number, range: number) {
        const ax = this.ax;
        const ay = this.ay;
        let count = 0;
        let sx;
        let sy;
        for (let i = 0; i < range; i++) {
            sx = x + ax[i];
            sy = y + ay[i];
            // 行による位置調整
            if (((sx % 2) === 0) && ((y % 2) === 1)) {
                sx--;
            }
            if ((sx < 0) || (sx >= settings.islandSize) ||
                (sy < 0) || (sy >= settings.islandSize)) {
                // 範囲外の場合
                if (kind === Island.lands.Sea) {
                    // 海なら加算
                    count++;
                }
            } else {
                if (land[sx][sy].kind === kind) {
                    count++;
                }
            }
        }
        return count;

    }
    private random(i: number) {
        return Math.floor(Math.random() * i);
    }
    private publicLog(log: string, id: number) {
        this.logData.pushLog({log, id, turn: this.islandTurn, secret: false});
    }
    private privateLog(log: string, id: number) {
        this.logData.pushLog({log, id, turn: this.islandTurn, secret: true});
    }
    private estimate(num: number) {
        let pop = 0;
        let area = 0;
        let farm = 0;
        let factory = 0;
        let mountain = 0;

        const island = this.islands[num];
        for (let y = 0; y < settings.islandSize; y++) {
            for (let x = 0; x < settings.islandSize; x++) {
                const kind = island.lands[x][y].kind;
                const value = island.lands[x][y].value;
                if ((kind !== Island.lands.Sea) &&
                    (kind !== Island.lands.Sbase) &&
                    (kind !== Island.lands.Oil)) {
                    area++;
                    if (kind === Island.lands.Town) {
                        pop += value;
                    } else if (kind === Island.lands.Farm) {
                        farm += value;
                    } else if (kind === Island.lands.Factory) {
                        factory += value;
                    } else if (kind === Island.lands.Mountain) {
                        mountain += value;
                    }
                }
            }
        }
        island.pop = pop;
        island.area = area;
        island.farm = farm;
        island.factory = factory;
        island.mountain = mountain;
    }
    private randomArray(num: number): number[] {
        const arr = [];
        for (let i = 0; i < num; i++) {
            arr[i] = i;
        }
        let m = arr.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);

            const t = arr[m];
            arr[m] = arr[i];
            arr[i] = t;
        }
        return arr;
    }
    private randomPointArray(): {rpx: number[], rpy: number[]} {
        // 元の箱庭諸島と厳密には非互換
        const rpx = [];
        const rpy = [];
        for (let j = 0; j < settings.islandSize; j++) {
            for (let i = 0; i < settings.islandSize; i++) {
                rpx[i + j * settings.islandSize] = i;
                rpy[i + j * settings.islandSize] = i;
            }
        }
        let m = rpx.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);

            const t = rpx[m];
            rpx[m] = rpx[i];
            rpx[i] = t;
        }
        m = rpy.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);

            const t = rpy[m];
            rpy[m] = rpy[i];
            rpy[i] = t;
        }
        return { rpx, rpy };
    }
    private landName(land: number, lv: number) {
        if (land === Island.lands.Sea) {
            if (lv === 1) {
                return "浅瀬";
            } else {
                return "海";
            }
        } else if (land === Island.lands.Waste) {
            return "荒地";
        } else if (land === Island.lands.Plains) {
            return "平地";
        } else if (land === Island.lands.Town) {
            if (lv < 30) {
                return "村";
            } else if (lv < 100) {
                return "町";
            } else {
                return "都市";
            }
        } else if (land === Island.lands.Forest) {
            return "森";
        } else if (land === Island.lands.Farm) {
            return "農場";
        } else if (land === Island.lands.Factory) {
            return "工場";
        } else if (land === Island.lands.Base) {
            return "ミサイル基地";
        } else if (land === Island.lands.Defence) {
            return "防衛施設";
        } else if (land === Island.lands.Mountain) {
            return "山";
        } else if (land === Island.lands.Monster) {
            return this.monsterSpec(lv).name;
        } else if (land === Island.lands.Sbase) {
            return "海底基地";
        } else if (land === Island.lands.Oil) {
            return "海底油田";
        } else if (land === Island.lands.Monument) {
            return settings.monumentName[lv];
        } else if (land === Island.lands.Haribote) {
            return "ハリボテ";
        }
    }
    private monsterSpec(lv: number) {
        const kind = Math.floor(lv / 10);
        const name = settings.monsterName[kind];
        const hp = lv - kind * 10;

        return { kind, name, hp };
    }
    private expToLevel(land: Island.Land) {
        if (land.kind === Island.lands.Base) {
            for (let i = settings.baseLevelUp.length; i > 1; i--) {
                if (land.value >= settings.baseLevelUp[i - 2]) {
                    return i;
                }
            }
            return 1;
        } else {
            for (let i = settings.sBaseLevelUp.length; i > 1; i--) {
                if (land.value >= settings.sBaseLevelUp[i - 2]) {
                    return i;
                }
            }
            return 1;
        }
    }
    private income(island: Island.Island) {
        const [pop, farm, factory, mountain] = [island.pop, island.farm * 10, island.factory, island.mountain];

        // 収入
        if (pop > farm) {
            // 農業だけじゃ手が余る場合
            island.food += farm; // 農場フル稼働
            island.money += Math.min(Math.floor((pop - farm) / 10), factory + mountain);
        } else {
            // 農業だけで手一杯の場合
            island.food += pop; // 全員野良仕事
        }

        // 食料消費
        island.food = Math.floor(island.food - pop * settings.eatenFood);
    }
    private doCommand(islandId: number) {
        const island = this.islands[islandId];
        const Commands = coms.coms;
        const command = island.commands.shift();
        console.log("command:", command);
        island.commands.push({
            kind: Commands.donothing.id,
            x: 0,
            y: 0,
            arg: 0,
            target: 0,
        });

        const [kind, target, x, y] = [command.kind, command.target, command.x, command.y];
        let arg = command.arg;
        const [name, id, landKind, lv] = [island.name, island.id, island.lands[x][y].kind, island.lands[x][y].value];
        const [cost, comName] = [coms.comFromId(kind).cost, coms.comFromId(kind).name];
        const [point, landName] = [`(${x}, ${y})`, this.landName(landKind, lv)];
        const turn = this.islandTurn;
        const ax = this.ax;
        const ay = this.ay;

        if (command.kind === coms.coms.donothing.id) {
            island.money += 10;
            island.absent++;

            if (island.absent >= settings.giveupTurn) {
                island.commands[0] = {
                    kind: coms.coms.giveup.id,
                    target: 0,
                    x: 0,
                    y: 0,
                    arg: 0,
                };
            }
            return 1;
        }

        island.absent = 0;

        if (cost > 0) {
            if (island.money < cost) {
                this.publicLog(`<span class="name">${name}島</span>で予定されていた` +
                `<span class="command">${comName}</span>は、資金不足のため中止されました。`, id);
                return 0;
            }
        } else if (cost < 0) {
            if (island.food < (-cost)) {
                this.publicLog(`<span class="name">${name}島</span>で予定されていた` +
                `<span class="command">${comName}</span>は、備蓄食料不足のため中止されました。`, id);
            }
        }
        if (kind === Commands.prepare.id || kind === Commands.prepare2.id) {
            if (landKind === Island.lands.Sea || landKind === Island.lands.Sbase || landKind === Island.lands.Oil
            || landKind === Island.lands.Mountain || landKind === Island.lands.Monster) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            island.lands[x][y] = { kind: Island.lands.Plains, value: 0};
            this.logData.logLandSuc({id, name, comName, point, turn});
            island.money -= cost;

            if (kind === Commands.prepare2.id) {
                // TODO:後で地ならしの場合にのカウンタを用意する
                return 0;
            } else {
                if (this.random(1000) < settings.disMaizo) {
                    const v = 100 + this.random(901);
                    island.money += v;
                    this.publicLog(`<span class="name">${name}島</span>での` +
                    `<span class="command">${comName}</span>中に、<b>${v + settings.unitMoney}もの埋蔵金</b>が発見されました。`, id);
                }
                return 1;
            }
        } else if (kind === Commands.reclaim.id) {
            if (landKind !== Island.lands.Sea && landKind !== Island.lands.Oil && landKind !== Island.lands.Sbase) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            const seaCount = this.countAround(island.lands, x, y, Island.lands.Sea, 7) +
            this.countAround(island.lands, x, y, Island.lands.Oil, 7) +
            this.countAround(island.lands, x, y, Island.lands.Sbase, 7);
            if (seaCount === 7) {
                this.publicLog(`<span class="name">${name}島</span>で予定されていた` +
                `<span class="command">${comName}</span>は、`
                + `予定地の<span class="point">${point}</span>の周辺に陸地がなかったため中止されました。`, id);
                return 0;
            }
            if (landKind === Island.lands.Sea && lv === 1) {
                // 浅瀬の場合
                // 目的の場所を荒地にする
                island.lands[x][y] = { kind: Island.lands.Waste, value: 0 };
                this.logData.logLandSuc({ id, name, comName, point, turn });
                island.area++;

                if (seaCount <= 4) {
                    // 周りの海が3ヘックス以内なので、浅瀬にする

                    for (let i = 0; i < 7; i++) {
                        let sx = x + ax[i];
                        const sy = y + ay[i];
                        // 行による位置調整
                        if (((sy % 2) === 0) && ((y % 2) === 1)) {
                            sx--;
                        }
                        // 範囲内の場合
                        if (!((sx < 0) || (sx >= settings.islandSize) ||
                            (sy < 0) || (sy >= settings.islandSize))) {
                            if (island.lands[sx][sy].kind === Island.lands.Sea) {
                                island.lands[sx][sy].value = 1;
                            }
                        }
                    }
                }
            } else {
                island.lands[x][y] = { kind: Island.lands.Sea, value: 1};
                this.logData.logLandSuc({ id, name, comName, point, turn });
            }

            island.money -= cost;
            return 1;
        } else if (kind === Commands.destroy.id) {
            if (landKind === Island.lands.Sbase || landKind === Island.lands.Oil || landKind === Island.lands.Monster) {
                // 海底基地、油田、怪獣は掘削できない
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            if ((landKind === Island.lands.Sea) && (lv === 0)) {
                // 海なら、油田探し
                // 投資額決定
                if (arg === 0) { arg = 1; }
                const value = Math.min(arg * cost, island.money);
                const str = value + settings.unitMoney;
                const p = Math.floor(value / cost);
                island.money -= value;

                if (p > this.random(100)) {
                    this.publicLog(`<span class="name">${name}島</span>で<b>${str}</b>の予算をつぎ込んだ` +
                    `<span class="command">${comName}</span>が行われ、<b>油田が掘り当てられました</b>`, id);
                    island.lands[x][y] = {kind: Island.lands.Oil, value: 0};
                } else {
                    this.publicLog(`<span class="name">${name}島</span>で<b>${str}</b>の予算をつぎ込んだ` +
                    `<span class="command">${comName}</span>が行われましたが、油田は見つかりませんでした。`, id);
                }
                return 1;
            }
            if (landKind === Island.lands.Mountain) {
                island.lands[x][y] = { kind: Island.lands.Waste, value: 0};
            } else if (landKind === Island.lands.Sea) {
                island.lands[x][y].value = 0;
            } else {
                island.lands[x][y] = { kind: Island.lands.Sea, value: 1};
                island.area--;
            }
            this.logData.logLandSuc({id, name, comName, point, turn});

            island.money -= cost;
            return 1;
        } else if (kind === Commands.selltree.id) {
            if (landKind !== Island.lands.Forest) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }

            island.lands[x][y] = { kind: Island.lands.Plains, value: 0 };
            this.logData.logLandSuc({ id, name, comName, point, turn });

            island.money += settings.treeValue * lv;
            return 1;
        } else if (kind === Commands.plant.id
        || kind === Commands.farm.id
        || kind === Commands.factory.id
        || kind === Commands.base.id
        || kind === Commands.monument.id
        || kind === Commands.haribote.id
        || kind === Commands.dbase.id) {
            if (!(
                (landKind === Island.lands.Plains) ||
                (landKind === Island.lands.Town) ||
                ((landKind === Island.lands.Monument) && (kind === Commands.monument.id)) ||
                ((landKind === Island.lands.Farm) && (kind === Commands.farm.id)) ||
                ((landKind === Island.lands.Factory) && (kind === Commands.factory.id)) ||
                ((landKind === Island.lands.Defence) && (kind === Commands.dbase.id))
            )) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            if (kind === Commands.plant.id) {
                island.lands[x][y] = {kind: Island.lands.Forest, value: 1};
                this.publicLog(`こころなしか、<span class="name">${name}島</span>の` +
                `<b>森</b>が増えたようです。`, id);
                this.privateLog(`<span class="name">${name}島${point}</span>で` +
                `<span class="command">${comName}</span>が行われました。`, id);
            } else if (kind === Commands.base.id) {
                island.lands[x][y] = {kind: Island.lands.Base, value: 0};
                this.publicLog(`こころなしか、<span class="name">${name}島</span>の` +
                `<b>森</b>が増えたようです。`, id);
                this.privateLog(`<span class="name">${name}島${point}</span>で` +
                `<span class="command">${comName}</span>が行われました。`, id);
            } else if (kind === Commands.haribote.id) {
                island.lands[x][y] = {kind: Island.lands.Haribote, value: 0};
                this.privateLog(`<span class="name">${name}島${point}</span>で` +
                `<span class="command">${comName}</span>が行われました。`, id);
                this.logData.logLandSuc({id, name, comName: Commands.haribote.name, point, turn});
            } else if (kind === Commands.farm.id) {
                if (landKind === Island.lands.Farm) {
                    island.lands[x][y].value += 2;
                    if (island.lands[x][y].value > 50) {
                        island.lands[x][y].value = 50;
                    }
                } else {
                    island.lands[x][y] = {kind: Island.lands.Farm, value: 10};
                }
                this.logData.logLandSuc({id, name, comName, point, turn});
            } else if (kind === Commands.factory.id) {
                if (landKind === Island.lands.Factory) {
                    island.lands[x][y].value += 10;
                    if (island.lands[x][y].value > 100) {
                        island.lands[x][y].value = 100;
                    }
                } else {
                    island.lands[x][y] = {kind: Island.lands.Factory, value: 30};
                }
                this.logData.logLandSuc({id, name, comName, point, turn});
            } else if (kind === Commands.dbase.id) {
                if (landKind === Island.lands.Defence) {
                    island.lands[x][y].value = 1;
                    this.publicLog(`<span class="name">${name}島${point}</span>の` +
                `<b>${landName}</b>の<b>自爆装置がセット</b>されました。`, id);
                } else {
                    island.lands[x][y] = {kind: Island.lands.Defence, value: 0};
                    this.logData.logLandSuc({id, name, comName, point, turn});
                }
            } else if (kind === Commands.monument.id) {
                if (landKind === Island.lands.Monument) {
                    // TODO:後で記念碑の攻撃を実装する。

                    island.lands[x][y] = {kind: Island.lands.Waste, value: 0};
                    this.publicLog(`<span class="name">${name}島${point}</span>の` +
                    `<b>${landName}</b>が<b>轟音とともに飛び立ちました</b>。`, id);
                } else {
                    island.lands[x][y].kind = Island.lands.Monument;
                    if (arg >= settings.monumentName.length) {
                        arg = 0;
                    }
                    island.lands[x][y].value = arg;
                    this.logData.logLandSuc({id, name, comName, point, turn});
                }
            }

            island.money -= cost;

            if (kind === Commands.farm.id || kind === Commands.factory.id) {
                if (arg > 1) {
                    arg--;
                    island.commands.pop();
                    island.commands.unshift({
                        kind,
                        target,
                        x,
                        y,
                        arg,
                    });
                }
            }
            return 1;
        } else if (kind === Commands.mountain.id) {
            if (landKind !== Island.lands.Mountain) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            island.lands[x][y].value += 5;
            if (island.lands[x][y].value > 200) {
                island.lands[x][y].value = 200;
            }
            this.logData.logLandSuc({id, name, comName, point, turn});

            island.money -= cost;
            if (arg > 1) {
                arg--;
                island.commands.pop();
                island.commands.unshift({
                    kind,
                    target,
                    x,
                    y,
                    arg,
                });
            }
            return 1;
        } else if (kind === Commands.sbase.id) {
            if (landKind !== Island.lands.Sea || lv !== 0) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            island.lands[x][y] = {kind: Island.lands.Sbase, value: 0};
            this.logData.logLandSuc({id, name, comName, point: "(?, ?)", turn});

            island.money -= cost;
            return 1;
        } else if (kind === Commands.missileNM.id
        || kind === Commands.missilePP.id
        || kind === Commands.missileST.id
        || kind === Commands.missileLD.id) {
            const tIsland = this.getIsland(target);
            if (tIsland === undefined) {
                    this.publicLog(`<span class="name">${name}島${point}</span>で予定されていた` +
                    `<span class="command">${comName}</span>は、目標の島に人が見当たらないため中止されました。`, id);
                    return 0;
            }
            let flag = 0;
            if (arg === 0) {
                arg = 10000;
            }
            const [tName, tLand] = [tIsland.name, tIsland.lands];
            let tx;
            let ty;
            let err;
            let boat = 0;
            if (kind === Commands.missilePP.id) {
                err = 7;
            } else {
                err = 19;
            }
            // 金が尽きるか指定数に足りるか基地全部が撃つまでループ
            let [bx, by, count] = [0, 0, 0];
            const rP = this.randomPointArray();
            const rpx = rP.rpx;
            const rpy = rP.rpy;

            while (arg > 0 && island.money >= cost) {
                // 基地を見つけるまでループ
                while (count < settings.islandSize * settings.islandSize) {
                    bx = rpx[count];
                    by = rpy[count];
                    if (island.lands[bx][by].kind === Island.lands.Base
                     || island.lands[bx][by].kind === Island.lands.Sbase) {
                        break;
                    }
                    count++;
                }
                if (count >= settings.islandSize * settings.islandSize) {
                    // 見つからなかったらそこまで
                    break;
                }
                // 最低一つ基地があったので、flagを立てる
                flag = 1;

                let level = this.expToLevel(island.lands[bx][by]);

                while (level > 0 && arg > 0 && island.money > cost) {
                    console.log(level, arg, "level--");
                    // 撃ったのが確定なので、各値を消耗させる
                    level--;
                    arg--;
                    island.money -= cost;

                    // 着弾点算出
                    const r = this.random(err);
                    tx = x + this.ax[r];
                    ty = y + this.ay[r];
                    if ((ty % 2) === 0 && (y % 2) === 1) {
                        tx--;
                    }
                    // 着弾点範囲内外チェック
                    if (tx < 0 || tx >= settings.islandSize
                    || ty < 0 || ty >= settings.islandSize) {
                        if (kind === Commands.missileST.id) {
                            // TODO:publicLogではなくlogLateを作って、使う。
                            this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                            `<span class="command">${comName}</span>を行いましたが、<b>領域外の海</b>に落ちた模様です。`, id);
                            this.privateLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、<b>領域外の海</b>に落ちた模様です。`, id);
                        } else {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、<b>領域外の海</b>に落ちた模様です。`, id);
                        }
                        continue;
                    }

                    // 着弾点の地形等算出
                    let tL = tLand[tx][ty].kind;
                    const tLv = tLand[tx][ty].value;
                    let tLname = this.landName(tL, tLv);
                    const tPoint = `(${tx}, ${ty})`;

                    let defence = 0;
                    if (tL === Island.lands.Defence) {
                        // do nothing
                    } else if (this.countAround(tLand, tx, ty, Island.lands.Defence, 19)) {
                        defence = 1;
                    }

                    if (defence === 1) {
                        if (kind === Commands.missileST.id) {
                            // TODO:publicLogではなくlogLateを作って、使う。
                            this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                            `<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>地点上空にて力場に捉えられ、<b>空中爆発</b>しました。`, id);
                            this.privateLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>地点上空にて力場に捉えられ、<b>空中爆発</b>しました。`, id);

                        } else {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>地点上空にて力場に捉えられ、<b>空中爆発</b>しました。`, id);
                        }
                        continue;
                    }

                    // 「効果なし」hexを最初に判定
                    if ((tL === Island.lands.Sea && tLv === 0) || // 深い海
                    ((tL === Island.lands.Sea || tL === Island.lands.Sbase
                    || tL === Island.lands.Mountain) // 海または海底基地または山で
                    && kind !== Commands.missileLD.id)) { // 陸地破壊弾以外
                        if (tL === Island.lands.Sbase) {
                            // 海底基地の場合、海のフリ
                            tL = Island.lands.Sea;
                        }
                        tLname = this.landName(tL, tLv);

                        // 無効化
                        if (kind === Commands.missileST.id) {
                            // TODO:publicLogではなくlogLateを作って、使う。
                            this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                            `<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に落ちたので被害がありませんでした。`, id);
                            this.privateLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に落ちたので被害がありませんでした。`, id);
                        } else {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に落ちたので被害がありませんでした。`, id);
                        }
                        continue;
                    }
                    if (kind === Commands.missileLD.id) {
                        if (tL === Island.lands.Mountain) {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行い` +
                            `<span class="name">${tPoint}</span>` +
                            `の<b>${tLname}</b>に命中。<b>${tLname}</b>は消し飛び、荒地と化しました。`, id);
                            tLand[tx][ty] = {kind: Island.lands.Waste, value: 0};
                            continue;
                        } else if (tL === Island.lands.Sbase) {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行い` +
                            `<span class="name">${tPoint}</span>` +
                            `の<b>${tLname}</b>に着水後爆発、同地点にあった<b>${tLname}</b>は跡形もなく吹き飛びました。`, id);
                        } else if (tL === Island.lands.Monster) {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行い` +
                            `<span class="name">${tPoint}</span>` +
                            `の<b>${tLname}</b>に着弾し爆発。陸地は<b>怪獣${tLname}</b>もろとも水没しました。`, id);
                        } else if (tL === Island.lands.Sea) {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行い` +
                            `<span class="name">${tPoint}</span>` +
                            `の<b>${tLname}</b>に着弾。海底がえぐられました。`, id);
                        } else {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行い` +
                            `<span class="name">${tPoint}</span>` +
                            `の<b>${tLname}</b>に着弾。陸地は水没しました。`, id);
                        }

                        if (tL === Island.lands.Town) {
                            if (island.lands[bx][by].kind === Island.lands.Base
                            || island.lands[bx][by].kind === Island.lands.Sbase) {
                                island.lands[bx][by].value += Math.floor(tLv / 20);
                                if (island.lands[bx][by].value > settings.maxExpPoint) {
                                    island.lands[bx][by].value = settings.maxExpPoint;
                                }
                            }
                        }

                        tLand[tx][ty] = {kind: Island.lands.Sea, value: 1};
                        tIsland.area--;

                        if (tL === Island.lands.Oil || tL === Island.lands.Sea || tL === Island.lands.Sbase) {
                            tLand[tx][ty].value = 0;
                        }
                    } else {
                        if (tL === Island.lands.Waste) {
                            if (kind === Commands.missileST.id) {
                            this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                            `<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に落ちました。`, id);
                            this.privateLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に落ちました。`, id);
                            } else {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行いましたが、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に落ちました。`, id);                            }
                        } else if (tL === Island.lands.Monster) {
                            const monsterSpec = this.monsterSpec(tLv);
                            const special = settings.monsterSpecial[monsterSpec.kind];

                            if ((special === 3 && (this.islandTurn % 2) === 1) ||
                                (special === 4) && (this.islandTurn % 2) === 0) {
                                if (kind === Commands.missileST.id) {
                                        this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                                            `<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中、しかし硬化状態だったため効果がありませんでした。`, id);
                                        this.privateLog(`<span class="name">${name}島</span>が` +
                                            `<span class="name">${tName}島${point}</span>` +
                                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中、しかし硬化状態だったため効果がありませんでした。`, id);
                                } else {
                                        this.publicLog(`<span class="name">${name}島</span>が` +
                                            `<span class="name">${tName}島${point}</span>` +
                                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中、しかし硬化状態だったため効果がありませんでした。`, id);
                                }
                                continue;
                            } else {
                                if (monsterSpec.hp === 1) {
                                    if (island.lands[bx][by].kind === Island.lands.Base
                                        || island.lands[bx][by].kind === Island.lands.Sbase) {
                                        island.lands[bx][by].value += settings.monsterExp[monsterSpec.kind];
                                        if (island.lands[bx][by].value > settings.maxExpPoint) {
                                            island.lands[bx][by].value = settings.maxExpPoint;
                                        }
                                    }
                                    if (kind === Commands.missileST.id) {
                                        // TODO:publicLogではなくlogLateを作って、使う。
                                        this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                                            `<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中。<B>怪獣${tLname}</B>は力尽き、倒れました。`, id);
                                        this.privateLog(`<span class="name">${name}島</span>が` +
                                            `<span class="name">${tName}島${point}</span>` +
                                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中。<B>怪獣${tLname}</B>は力尽き、倒れました。`, id);
                                    } else {
                                        this.publicLog(`<span class="name">${name}島</span>が` +
                                            `<span class="name">${tName}島${point}</span>` +
                                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中。<B>怪獣${tLname}</B>は力尽き、倒れました。`, id);
                                    }

                                    const value = settings.monsterValue[monsterSpec.kind];
                                    if (value > 0) {
                                        island.money += value;
                                        // logMsMonMoney
                                    }

                                    // TODO:賞関係
                                } else {
                                    if (kind === Commands.missileST.id) {
                                        // TODO:publicLogではなくlogLateを作って、使う。
                                        this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                                            `<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中。<B>怪獣${tLname}</B>は苦しそうに咆哮しました。`, id);
                                        this.privateLog(`<span class="name">${name}島</span>が` +
                                            `<span class="name">${tName}島${point}</span>` +
                                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中。<B>怪獣${tLname}</B>は苦しそうに咆哮しました。`, id);
                                    } else {
                                        this.publicLog(`<span class="name">${name}島</span>が` +
                                            `<span class="name">${tName}島${point}</span>` +
                                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                                            `<span class="name">${tPoint}</span>` +
                                            `の<B>怪獣${tLname}</B>に命中。<B>怪獣${tLname}</B>は苦しそうに咆哮しました。`, id);
                                    }
                                    tIsland.lands[tx][ty].value--;
                                    continue;
                                }
                            }
                        } else {
                            if (kind === Commands.missileST.id) {
                            // TODO:publicLogではなくlogLateを作って、使う。
                            this.publicLog(`<b>何者か</b><span class="name">${name}島${point}</span>へ向けて` +
                            `<span class="command">${comName}</span>を行い、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に命中、一帯が壊滅しました。`, id);
                            this.privateLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に命中、一帯が壊滅しました。`, id);
                            } else {
                            this.publicLog(`<span class="name">${name}島</span>が` +
                            `<span class="name">${tName}島${point}</span>` +
                            `地点に向けて<span class="command">${comName}</span>を行い、` +
                            `<span class="name">${tPoint}</span>` +
                            `の<B>${tLname}</B>に命中、一帯が壊滅しました。`, id);
                            }
                        }
                        if (tL === Island.lands.Town) {
                            if (island.lands[bx][by].kind === Island.lands.Base
                            || island.lands[bx][by].kind === Island.lands.Sbase) {
                                island.lands[bx][by].value += Math.floor(tLv / 20);
                                boat += tLv;
                                if (island.lands[bx][by].value > settings.maxExpPoint) {
                                    island.lands[bx][by].value = settings.maxExpPoint;
                                }
                            }
                        }

                        tIsland.lands[tx][ty] = {kind: Island.lands.Waste, value: 1};

                        if (tL === Island.lands.Oil) {
                            tIsland.lands[tx][ty] = {kind: Island.lands.Sea, value: 0};
                        }
                    }
                }
                count++;
            }
            if (flag === 0) {
                // logMsNoBase
                return 0;
            }

            boat = Math.floor(boat / 2);
            if (boat > 0 && id !== target && kind !== Commands.missileST.id) {
                let achive;
                for (let i = 0; (i < settings.islandSize * settings.islandSize && boat > 0); i++) {
                    bx = rpx[i];
                    by = rpy[i];
                    if (island.lands[bx][by].kind === Island.lands.Town) {
                        let bLv = island.lands[bx][by].value;
                        if (boat > 50) {
                            bLv += 50;
                            boat -= 50;
                            achive += 50;
                        } else {
                            bLv += boat;
                            achive += boat;
                            boat = 0;
                        }
                        if (lv > 200) {
                            boat += bLv - 200;
                            achive -= bLv - 200;
                            bLv = 200;
                        }
                        island.lands[bx][by].value = lv;
                    } else if (island.lands[bx][by].kind === Island.lands.Plains) {
                        island.lands[bx][by].kind = Island.lands.Town;
                        if (boat > 10) {
                            island.lands[bx][by].value = 5;
                            boat -= 10;
                            achive += 10;
                        } else if (boat > 5) {
                            island.lands[bx][by].value = boat - 5;
                            achive += boat;
                            boat = 0;
                        }
                    }
                    if (boat <= 0) {
                        break;
                    }
                }
                if (achive > 0) {
                    // 少しでも到着した場合、ログを吐く
                    this.publicLog(`<span class="name">${name}島</span>にどこからともなく` +
                        `<B>${achive}${settings.unitPop}もの難民</B>が漂着しました。` +
                        `<span class="name">${name}島</span>は快く受け入れたようです。`, id);

                    // 難民の数が一定数以上なら、平和賞の可能性あり
                    // TODO:平和賞
                }
            }
        } else if (kind === Commands.sendmonster.id) {
            const tIsland = this.getIsland(target);
            if (tIsland === undefined) {
                    this.publicLog(`<span class="name">${name}島${point}</span>で予定されていた` +
                    `<span class="command">${comName}</span>は、目標の島に人が見当たらないため中止されました。`, id);
                    return 0;
            }

            this.publicLog(`<span class="name">${name}島${point}</span>が<b>人造怪獣</b>を製造。` +
                `<span class="name">${tIsland.name}島</span>へ送りこみました。`, id);
            // tIsland.monstersend++
            island.money -= cost;
            return 1;
        } else if (kind === Commands.sell.id) {
            if (arg === 0) { arg = 1; }
            const value = Math.min(arg * -cost, island.food);

            this.publicLog(`<span class="name">${name}島</span>が` +
            `<b>${value + settings.unitFood}</b>の<span class="command">${comName}</span>を行いました。`, id);
            island.food -= value;
            island.money += value / 10;
            return 0;
        } else if (kind === Commands.food.id || kind === Commands.money.id) {
            const tIsland = this.getIsland(target);

            if (arg === 0) { arg = 1; }
            let value;
            let str;
            if (cost < 0) {
                value = Math.min(arg * -cost, island.food);
                str = `${value}${settings.unitFood}`;
            } else {
                value = Math.min(arg * cost, island.money);
                str = `${value}${settings.unitMoney}`;
            }

            this.publicLog(`<span class="name">${name}島</span>が<span class="name">${tIsland.name}島</span>へ` +
            `<b>${str}</b>の<span class="command">${comName}</span>を行いました。`, id);

            if (cost < 0) {
                island.food -= value;
                tIsland.food += value;
            } else {
                island.money -= value;
                tIsland.food += value;
            }
            return 0;
        } else if (kind === Commands.propaganda.id) {
            this.publicLog(`<span class="name">${name}島</span>で<span class="command">${comName}</span>が行われました。`, id);
            this.islandMemo[id].propaganda = 1;
            island.money -= cost;
        } else if (kind === Commands.giveup.id) {
            this.publicLog(`<span class="name">${name}島</span>は放棄され、<b>無人島</b>となりました。`, id);
            // logHistory(`<span class="name">${name}島</span>、放棄され<b>無人島</b>となる。`)
            this.islandMemo[id].dead = 1;
            return 1;
        }
        return 1;
    }
}