import coms from "./coms";
import * as lib from "./lib";
interface NewIslandArg {
    name: string;
    password: string;
    password2: string;
    hako: lib.Hakojima;
}
export function newIslandMain(arg: NewIslandArg) {
    if (arg.hako.islands.length >= lib.settings.maxIsland) {
        return "申し訳ありません、島が一杯で登録できません！！";
    }
    if (arg.name === "") {
        return "島につける名前が必要です。";
    }
    if (/[,\?\(\)\<\>]|^無人$/.test(arg.name)) {
        return "',?()<>\$'とか入ってたり、「無人島」とかいった変な名前はやめましょうよ〜";
    }
    for (const island of arg.hako.islands) {
        if (island.name === arg.name) {
            return "その島ならすでに発見されています。";
        }
    }
    if (arg.password === "") {
        return "パスワードが必要です。";
    }
    if (arg.password !== arg.password2) {
        return "パスワードが違います。";
    }
    const island = new lib.Island();
    island.lands = makeNewLand();
    island.name = arg.name;
    island.id = arg.hako.nextId;
    arg.hako.nextId++;
    island.absent = lib.settings.giveupTurn - 3;
    island.comment = "(未登録)";
    island.password = lib.encodepass(arg.password);
    const index = arg.hako.islands.push(island);
    estimate(index - 1, arg.hako);
    return null;
}
function makeNewLand(): lib.Land[][] {
    const land: lib.Land[][] = [];

    for (let x = 0; x < lib.settings.islandSize; x++) {
        land[x] = [];
        for (let y = 0; y < lib.settings.islandSize; y++) {
            land[x][y] = { kind: lib.lands.Sea, value: 0 };
        }
    }
    const center = lib.settings.islandSize / 2 - 1;
    for (let y = center - 1; y < center + 3; y++) {
        for (let x = center - 1; x < center + 3; x++) {
            land[x][y].kind = lib.lands.Waste;
        }
    }

    // 8*8範囲内に陸地を増殖
    for (let i = 0; i < 120; i++) {
        const x = random(8) + center - 3;
        const y = random(8) + center - 3;

        if (countAround(land, x, y, lib.lands.Sea, 7) !== 7) {
            // 周りに陸地がある場合、浅瀬にする
            // 浅瀬は荒地にする
            // 荒地は平地にする
            if (land[x][y].kind === lib.lands.Waste) {
                land[x][y].kind = lib.lands.Plains;
                land[x][y].value = 0;
            } else {
                if (land[x][y].value === 1) {
                    land[x][y].kind = lib.lands.Waste;
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
        const x = random(4) + center - 1;
        const y = random(4) + center - 1;

        // そこがすでに森でなければ、森を作る
        if (land[x][y].kind !== lib.lands.Forest) {
            land[x][y].kind = lib.lands.Forest;
            land[x][y].value = 5;
            count++;
        }
    }

    // 町を作る
    count = 0;
    while (count < 2) {
        const x = random(4) + center - 1;
        const y = random(4) + center - 1;

        if ((land[x][y].kind !== lib.lands.Town) &&
            (land[x][y].kind !== lib.lands.Forest)) {
            land[x][y].kind = lib.lands.Town;
            land[x][y].value = 5;
            count++;
        }
    }

    // 山を作る
    count = 0;
    while (count < 1) {
        const x = random(4) + center - 1;
        const y = random(4) + center - 1;

        if ((land[x][y].kind !== lib.lands.Town) &&
            (land[x][y].kind !== lib.lands.Forest)) {
            land[x][y].kind = lib.lands.Mountain;
            land[x][y].value = 0;
            count++;
        }
    }

    // 基地を作る
    count = 0;
    while (count < 2) {
        const x = random(4) + center - 1;
        const y = random(4) + center - 1;

        if ((land[x][y].kind !== lib.lands.Town) &&
            (land[x][y].kind !== lib.lands.Forest) &&
            (land[x][y].kind !== lib.lands.Mountain)) {
            land[x][y].kind = lib.lands.Base;
            land[x][y].value = 0;
            count++;
        }
    }
    return land;
}
function countAround(land: lib.Land[][], x: number, y: number, kind: number, range: number) {
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
        if ((sx < 0) || (sx >= lib.settings.islandSize) ||
            (sy < 0) || (sy >= lib.settings.islandSize)) {
            // 範囲外の場合
            if (kind === lib.lands.Sea) {
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
function random(i: number) {
    return Math.floor(Math.random() * i);
}
function estimate(num: number, hako: lib.Hakojima) {
    let pop = 0;
    let area = 0;
    let farm = 0;
    let factory = 0;
    let mountain = 0;

    const island = hako.islands[num];
    for (let y = 0; y < lib.settings.islandSize; y++) {
        for (let x = 0; x < lib.settings.islandSize; x++) {
            const kind = island.lands[x][y].kind;
            const value = island.lands[x][y].value;
            if ((kind !== lib.lands.Sea) &&
                (kind !== lib.lands.Sbase) &&
                (kind !== lib.lands.Oil)) {
                area++;
                if (kind === lib.lands.Town) {
                    pop += value;
                } else if (kind === lib.lands.Farm) {
                    farm += value;
                } else if (kind === lib.lands.Factory) {
                    factory += value;
                } else if (kind === lib.lands.Mountain) {
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
function randomArray(num: number) {
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
function randomPointArray() {
    // 元の箱庭諸島と厳密には非互換
    const rpx = [];
    const rpy = [];
    for (let i = 0; i < lib.settings.islandSize; i++) {
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
    return {rpx, rpy};
}
function income(island: lib.Island, hako: lib.Hakojima) {
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
    island.food = Math.floor(island.food - pop * lib.settings.eatenFood);
}
function doCommand(island: lib.Island) {
    const command = island.commands.splice(0, 1)[0];

    if (command.kind === coms.coms.donothing.id) {
        island.money += 10;
        island.absent++;

        if (island.absent >= lib.settings.giveupTurn) {
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
export function turnMain(hako: lib.Hakojima) {
    // 最終更新時間を更新
    hako.islandLastTime += lib.settings.unitTime;

    // ターン番号
    hako.islandTurn++;

    // 順番決め
    const order = randomArray(hako.islands.length);

    // 収入、消費フェイズ
    for (let i = 0; i < hako.islands.length; i++) {
        estimate(order[i], hako);
        income(hako.islands[order[i]], hako);
    }
}