import * as turn from "./hako-turn";
import * as lib from "./lib";
const dmyislands = [
    {
        name: "hogesima",
        id: 1,
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
console.log(lib.hako.comFromId(3));
console.log(lib.hako.unitTime);
const gNextId = 0;
const ret = turn.newIslandMain({
    islandNumber: 1,
    name: "hoge",
    password: "pass",
    password2: "pass",
    islands: dmyislands,
    nextId: gNextId,
});
if (ret !== true) {
    console.log(ret.message);
}