import * as lib from "./lib";
export function newIslandMain(arg: lib.NewIslandArg) {
    const ret: { islands: lib.Island[] | null, nextId: number, err: string | null }
        = { islands: null, nextId: -1, err: null };
    if (arg.islands.length >= lib.hako.maxIsland) {
        ret.err = "申し訳ありません、島が一杯で登録できません！！";
        return ret;
    }
    if (arg.name === "") {
        ret.err = "島につける名前が必要です。";
        return ret;
    }
    if (/[,\?\(\)\<\>]|^無人$/.test(arg.name)) {
        ret.err = "',?()<>\$'とか入ってたり、「無人島」とかいった変な名前はやめましょうよ〜";
        return ret;
    }
    for (const island of arg.islands) {
        if (island.name === arg.name) {
            ret.err = "その島ならすでに発見されています。";
            return ret;
        }
    }
    if (arg.password === "") {
        ret.err = "パスワードが必要です。" ;
        return ret;
    }
    if (arg.password !== arg.password2) {
        ret.err = "パスワードが違います。";
        return ret;
    }
    const island = new lib.IslandClass();
    island.lands = makeNewLand();
    island.name = arg.name;
    island.id = arg.nextId;
    arg.nextId++;
    island.absent = lib.hako.giveupTurn - 3;
    island.comment = "(未登録)";
    island.password = lib.encodepass(arg.password);
    arg.islands.push(island);
    ret.islands = arg.islands;
    ret.nextId = arg.nextId;
    return ret;
}
function makeNewLand(): lib.Land[][] {
    const land: lib.Land[][] = [];
    // 勝手に配列が広がらないので。幸い、xとyを入れ替えても同じ。
    for (let y = 0; y < lib.hako.islandSize; y++) {
        land[y] = [];
        for (let x = 0; x < lib.hako.islandSize; x++) {
            land[y][x] = { land: lib.lands.Sea, value: 0 };
        }
    }
    const center = lib.hako.islandSize / 2 - 1;
    for (let y = center - 1; y < center + 3; y++) {
        for (let x = center - 1; x < center + 3; x++) {
            land[x][y].land = lib.lands.Waste;
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
            if (land[x][y].land === lib.lands.Waste) {
                land[x][y].land = lib.lands.Plains;
                land[x][y].value = 0;
            } else {
                if (land[x][y].value === 1) {
                    land[x][y].land = lib.lands.Waste;
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
        if (land[x][y].land !== lib.lands.Forest) {
            land[x][y].land = lib.lands.Forest;
            land[x][y].value = 5;
            count++;
        }
    }

    // 町を作る
    count = 0;
    while (count < 2) {
        const x = random(4) + center - 1;
        const y = random(4) + center - 1;

        if ((land[x][y].land !== lib.lands.Town) &&
            (land[x][y].land !== lib.lands.Forest)) {
            land[x][y].land = lib.lands.Town;
            land[x][y].value = 5;
            count++;
        }
    }

    // 山を作る
    count = 0;
    while (count < 1) {
        const x = random(4) + center - 1;
        const y = random(4) + center - 1;

        if ((land[x][y].land !== lib.lands.Town) &&
            (land[x][y].land !== lib.lands.Forest)) {
            land[x][y].land = lib.lands.Mountain;
            land[x][y].value = 0;
            count++;
        }
    }

    // 基地を作る
    count = 0;
    while (count < 2) {
        const x = random(4) + center - 1;
        const y = random(4) + center - 1;

        if ((land[x][y].land !== lib.lands.Town) &&
            (land[x][y].land !== lib.lands.Forest) &&
            (land[x][y].land !== lib.lands.Mountain)) {
            land[x][y].land = lib.lands.Base;
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
        if ((sx < 0) || (sx >= lib.hako.islandSize) ||
            (sy < 0) || (sy >= lib.hako.islandSize)) {
            // 範囲外の場合
            if (kind === lib.lands.Sea) {
                // 海なら加算
                count++;
            }
        } else {
            if (land[sx][sy].land === kind) {
                count++;
            }
        }
    }
    return count;

}
function random(i: number) {
    return Math.floor(Math.random() * i);
}