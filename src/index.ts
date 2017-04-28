import * as turn from "./hako-turn";
import * as lib from "./lib";
const json = require("../test2.json");
const hako = new lib.Hakojima(json);
let ret = turn.newIslandMain({
    name: "hige",
    password: "pass",
    password2: "pass",
    islands: hako.islands,
    nextId: hako.nextId,
});
if (ret.err) {
    console.log(ret.err);
} else {
    hako.nextId = ret.nextId;
    hako.islands = ret.islands;
}
for (let i = 0; i < 10; i++) {
    ret = turn.newIslandMain({
        name: "hige" + i,
        password: "pass",
        password2: "pass",
        islands: hako.islands,
        nextId: hako.nextId,
    });
    if (ret.err) {
        console.log(ret.err);
    } else {
        hako.nextId = ret.nextId;
        hako.islands = ret.islands;
    }
}
console.log(JSON.stringify({ nextId: hako.nextId, islands: hako.islands }));
