import * as turn from "./hako-turn";
import * as lib from "./lib";
let gIslands = [
    {
        name: "hogesima",
        id: 0,
        prize: "hogehoge", // TBD
        absent: 2,
        comment: "yahoo",
        password: "crypted",
        money: 1,
        food: 1,
        pop: 1,
        area: 1,
        farm: 1,
        factory: 1,
        mountain: 1,
        score: 1,
        lands: [[{ land: 0, value: 0 }, { land: 0, value: 0 }, { land: 0, value: 0 }],
        [{ land: 0, value: 0 }, { land: 0, value: 0 }, { land: 0, value: 0 }],
        [{ land: 0, value: 0 }, { land: 0, value: 0 }, { land: 0, value: 0 }]],
        commands: [{ kind: 0, target: 0, x: 0, y: 0, arg: 0 }],
        bbs: [""],
    },
];
let gNextId = 1;
let ret = turn.newIslandMain({
    name: "hoge",
    password: "pass",
    password2: "pass",
    islands: gIslands,
    nextId: gNextId,
});
if (ret.err) {
    console.log(ret.err);
} else {
    gNextId = ret.nextId;
    gIslands = ret.islands;
}
for (let i = 0; i < 10; i++) {
    ret = turn.newIslandMain({
        name: "hoge" + i,
        password: "pass",
        password2: "pass",
        islands: gIslands,
        nextId: gNextId,
    });
    if (ret.err) {
        console.log(ret.err);
    } else {
        gNextId = ret.nextId;
        gIslands = ret.islands;
    }
}
console.log(JSON.stringify(gIslands));
