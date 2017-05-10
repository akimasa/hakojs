import coms from "./coms";
import Island from "./Island";
import { Land as Land } from "./Island";
import { lands as lands } from "./lands";
import * as lib from "./lib";
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
    constructor() {
        this.nextId = 1;
        this.islandLastTime = new Date().getTime();
        this.islandTurn = 1;
        this.islands = [];
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
            },
        };
    }
    public getIsland(id: number) {
        return this.islands.find((ele) => ele.id === id);
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
        // 最終更新時間を更新
        this.islandLastTime += settings.unitTime;

        // ターン番号
        this.islandTurn++;

        // 順番決め
        const order = this.randomArray(this.islands.length);

        // 収入、消費フェイズ
        for (let i = 0; i < this.islands.length; i++) {
            this.estimate(order[i]);
            this.income(this.islands[order[i]]);
        }
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
        const ax = [0, 1, 1, 1, 0, -1, 0, 1, 2, 2, 2, 1, 0, -1, -1, -2, -1, -1, 0];
        const ay = [0, -1, 0, 1, 1, 0, -1, -2, -1, 0, 1, 2, 2, 2, 1, 0, -1, -2, -2];
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
        const command = island.commands.splice(0, 1)[0];

        const [kind, target, x, y, arg] = [command.kind, command.target, command.x, command.y, command.arg];
        const [name, id, landKind, lv] = [island.name, island.id, island.lands[x][y].kind, island.lands[x][y].value];
        const [cost, comName] = [coms.comFromId(kind).cost, coms.comFromId(kind).name];
        const [point, landName] = [`(${x}, ${y})`, this.landName(landKind, lv)];

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
    }
}