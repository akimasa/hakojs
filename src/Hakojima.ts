import coms from "./coms";
import Island from "./Island";
import { Land as Land } from "./Island";
import { CamouflagedIsland as CamouflagedIsland } from "./Island";
import { lands as lands } from "./lands";
import * as lib from "./lib";
import Log from "./Log";
import settings from "./settings";
interface NewIslandArg {
    name: string;
    password: string;
    password2: string;
}
export default class Hakojima {
    public nextId: number;
    public islandLastTime: number;
    public islandTurn: number;
    public islands: Island[];
    public logData: Log;
    private ax = [0, 1, 1, 1, 0, -1, 0, 1, 2, 2, 2, 1, 0, -1, -1, -2, -1, -1, 0];
    private ay = [0, -1, 0, 1, 1, 0, -1, -2, -1, 0, 1, 2, 2, 2, 1, 0, -1, -2, -2];
    constructor() {
        this.nextId = 1;
        this.islandLastTime = new Date().getTime();
        this.islandLastTime = this.islandLastTime - (this.islandLastTime % (settings.unitTime * 1000));
        this.islandTurn = 1;
        this.islands = [];
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
        return JSON.stringify({
            nextId: this.nextId,
            islandLastTime: this.islandLastTime,
            islandTurn: this.islandTurn,
            islands: this.islands,
        });
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
    public getCamouflagedIsland(id: number): CamouflagedIsland {
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
        const island = new Island();
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
        const oldPop = [];
        // 最終更新時間を更新
        this.islandLastTime += settings.unitTime * 1000;

        // ターン番号
        this.islandTurn++;

        // 順番決め
        const order = this.randomArray(this.islands.length);

        // 収入、消費フェイズ
        for (let i = 0; i < this.islands.length; i++) {
            this.estimate(order[i]);
            this.income(this.islands[order[i]]);
            // ターン開始前の人口をメモる
            oldPop[order[i]] = this.islands[order[i]].pop;
        }

        // コマンド処理
        for (let i = 0; i < this.islands.length; i++) {
            while (1) {
                if (this.doCommand(this.islands[order[i]]) !== 0) {
                    break;
                }
            }
        }

    }
    private camouflageLands(rawLands: Land[][]): Land[][] {
        const camouflagedLands: Land[][] = [[]];
        for (let x = 0; x < settings.islandSize; x++) {
            camouflagedLands[x] = [];
            for (let y = 0; y < settings.islandSize; y++) {
                camouflagedLands[x][y] = {kind: rawLands[x][y].kind, value: rawLands[x][y].value};
                if (camouflagedLands[x][y].kind === lands.Base || camouflagedLands[x][y].kind === lands.Sbase) {
                    camouflagedLands[x][y].value = 0;
                }
                if (camouflagedLands[x][y].kind === lands.Base) {
                    camouflagedLands[x][y].kind = lands.Forest;
                }
                if (camouflagedLands[x][y].kind === lands.Forest) {
                    camouflagedLands[x][y].value = 0;
                }
                if (camouflagedLands[x][y].kind === lands.Sbase) {
                    camouflagedLands[x][y].kind = lands.Sea;
                }
            }
        }
        return camouflagedLands;
    }
    private getIslandsCamouflagedSummary(): Island[] {
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
    private makeNewLand(): Land[][] {
        const land: Land[][] = [];

        for (let x = 0; x < settings.islandSize; x++) {
            land[x] = [];
            for (let y = 0; y < settings.islandSize; y++) {
                land[x][y] = { kind: lands.Sea, value: 0 };
            }
        }
        const center = settings.islandSize / 2 - 1;
        for (let y = center - 1; y < center + 3; y++) {
            for (let x = center - 1; x < center + 3; x++) {
                land[x][y].kind = lands.Waste;
            }
        }

        // 8*8範囲内に陸地を増殖
        for (let i = 0; i < 120; i++) {
            const x = this.random(8) + center - 3;
            const y = this.random(8) + center - 3;

            if (this.countAround(land, x, y, lands.Sea, 7) !== 7) {
                // 周りに陸地がある場合、浅瀬にする
                // 浅瀬は荒地にする
                // 荒地は平地にする
                if (land[x][y].kind === lands.Waste) {
                    land[x][y].kind = lands.Plains;
                    land[x][y].value = 0;
                } else {
                    if (land[x][y].value === 1) {
                        land[x][y].kind = lands.Waste;
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
            if (land[x][y].kind !== lands.Forest) {
                land[x][y].kind = lands.Forest;
                land[x][y].value = 5;
                count++;
            }
        }

        // 町を作る
        count = 0;
        while (count < 2) {
            const x = this.random(4) + center - 1;
            const y = this.random(4) + center - 1;

            if ((land[x][y].kind !== lands.Town) &&
                (land[x][y].kind !== lands.Forest)) {
                land[x][y].kind = lands.Town;
                land[x][y].value = 5;
                count++;
            }
        }

        // 山を作る
        count = 0;
        while (count < 1) {
            const x = this.random(4) + center - 1;
            const y = this.random(4) + center - 1;

            if ((land[x][y].kind !== lands.Town) &&
                (land[x][y].kind !== lands.Forest)) {
                land[x][y].kind = lands.Mountain;
                land[x][y].value = 0;
                count++;
            }
        }

        // 基地を作る
        count = 0;
        while (count < 2) {
            const x = this.random(4) + center - 1;
            const y = this.random(4) + center - 1;

            if ((land[x][y].kind !== lands.Town) &&
                (land[x][y].kind !== lands.Forest) &&
                (land[x][y].kind !== lands.Mountain)) {
                land[x][y].kind = lands.Base;
                land[x][y].value = 0;
                count++;
            }
        }
        return land;
    }
    private countAround(land: Land[][], x: number, y: number, kind: number, range: number) {
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
                if (kind === lands.Sea) {
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
                if ((kind !== lands.Sea) &&
                    (kind !== lands.Sbase) &&
                    (kind !== lands.Oil)) {
                    area++;
                    if (kind === lands.Town) {
                        pop += value;
                    } else if (kind === lands.Farm) {
                        farm += value;
                    } else if (kind === lands.Factory) {
                        factory += value;
                    } else if (kind === lands.Mountain) {
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
    private randomArray(num: number) {
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
    private randomPointArray() {
        // 元の箱庭諸島と厳密には非互換
        const rpx = [];
        const rpy = [];
        for (let i = 0; i < settings.islandSize; i++) {
            rpx[i] = i;
            rpy[i] = i;
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
        if (land === lands.Sea) {
            if (lv === 1) {
                return "浅瀬";
            } else {
                return "海";
            }
        } else if (land === lands.Waste) {
            return "荒地";
        } else if (land === lands.Plains) {
            return "平地";
        } else if (land === lands.Town) {
            if (lv < 30) {
                return "村";
            } else if (lv < 100) {
                return "町";
            } else {
                return "都市";
            }
        } else if (land === lands.Forest) {
            return "森";
        } else if (land === lands.Farm) {
            return "農場";
        } else if (land === lands.Factory) {
            return "工場";
        } else if (land === lands.Base) {
            return "ミサイル基地";
        } else if (land === lands.Mountain) {
            return "山";
        } else if (land === lands.Monster) {
            return this.monsterSpec(lv).name;
        } else if (land === lands.Sbase) {
            return "海底基地";
        } else if (land === lands.Oil) {
            return "海底油田";
        } else if (land === lands.Monument) {
            return settings.monumentName[lv];
        } else if (land === lands.Haribote) {
            return "ハリボテ";
        }
    }
    private monsterSpec(lv: number) {
        const kind = Math.floor(lv / 10);
        const name = settings.monsterName[kind];
        const hp = lv - kind * 10;

        return { kind, name, hp };
    }
    private income(island: Island) {
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
    private doCommand(island: Island) {
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
            if (landKind === lands.Sea || landKind === lands.Sbase || landKind === lands.Oil
            || landKind === lands.Oil || landKind === lands.Monster) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            island.lands[x][y] = { kind: lands.Plains, value: 0};
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
            if (landKind !== lands.Sea && landKind !== lands.Oil && landKind !== lands.Sbase) {
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            const seaCount = this.countAround(island.lands, x, y, lands.Sea, 7) +
            this.countAround(island.lands, x, y, lands.Oil, 7) +
            this.countAround(island.lands, x, y, lands.Sbase, 7);
            if (seaCount === 7) {
                this.publicLog(`<span class="name">${name}島</span>で予定されていた` +
                `<span class="command">${comName}</span>は、`
                + `予定地の<span class="point">${point}</span>の周辺に陸地がなかったため中止されました。`, id);
                return 0;
            }
            if (landKind === lands.Sea && lv === 1) {
                // 浅瀬の場合
                // 目的の場所を荒地にする
                island.lands[x][y] = { kind: lands.Waste, value: 0 };
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
                            if (island.lands[sx][sy].kind === lands.Sea) {
                                island.lands[sx][sy].value = 1;
                            }
                        }
                    }
                }
            } else {
                island.lands[x][y] = { kind: lands.Sea, value: 1};
                this.logData.logLandSuc({ id, name, comName, point, turn });
            }

            island.money -= cost;
            return 1;
        } else if (kind === Commands.destroy.id) {
            if (landKind === lands.Sbase || landKind === lands.Oil || landKind === lands.Monster) {
                // 海底基地、油田、怪獣は掘削できない
                this.logData.logLandFail({id, name, comName, landName, point, turn});
                return 0;
            }
            if ((landKind === lands.Sea) && (lv === 0)) {
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
                    island.lands[x][y] = {kind: lands.Oil, value: 0};
                } else {
                    this.publicLog(`<span class="name">${name}島</span>で<b>${str}</b>の予算をつぎ込んだ` +
                    `<span class="command">${comName}</span>が行われましたが、油田は見つかりませんでした。`, id);
                }
                return 1;
            }
            if (landKind === lands.Mountain) {
                island.lands[x][y] = { kind: lands.Waste, value: 0};
            } else if (landKind === lands.Sea) {
                island.lands[x][y].value = 0;
            } else {
                island.lands[x][y] = { kind: lands.Sea, value: 1};
                island.area--;
            }
            this.logData.logLandSuc({id, name, comName, point, turn});

            island.money -= cost;
            return 1;
        }

        if (command.kind === Commands.farm.id) {
            island.lands[x][y] = { kind: lands.Farm, value: 100 };
            return 1;
        }
    }
}