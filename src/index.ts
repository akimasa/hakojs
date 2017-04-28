import * as turn from "./hako-turn";
import * as lib from "./lib";
const json = require("../test3.json");
const hako = new lib.Hakojima(json);
let ret = turn.newIslandMain({
    name: "higee",
    password: "pass",
    password2: "pass",
    hako,
});
if (ret) {
    console.log(ret);
}
for (let i = 0; i < 10; i++) {
    ret = turn.newIslandMain({
        name: "higee" + i,
        password: "pass",
        password2: "pass",
        hako,
    });
    if (ret) {
        console.log(ret);
    }
}
console.log(JSON.stringify({ nextId: hako.nextId, islands: hako.islands }));
