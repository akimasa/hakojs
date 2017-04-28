import * as turn from "./hako-turn";
import * as lib from "./lib";
let gIslands = require("../testfile.json");
let gNextId = 1;
let ret = turn.newIslandMain({
    name: "hige",
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
        name: "hige" + i,
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
