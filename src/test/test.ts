import * as assert from "assert";
import * as turn from "../hako-turn";
import * as lib from "../lib";
const json = require("../../test3.json");
const hako = new lib.Hakojima(json);
describe("turn newIsland", () => {
    it("fails when wrong password confirm", () => {
        const ret = turn.newIslandMain({
            name: "higee",
            password: "pass",
            password2: "passwrong",
            hako,
        });
        assert.notStrictEqual(ret, null);
    });
    it("fails when there are same island name", () => {
        const ret = turn.newIslandMain({
            name: "hoge",
            password: "pass",
            password2: "pass",
            hako,
        });
        assert.notStrictEqual(ret, null);
    });
    it("success when no problem", () => {
        for (let i = 0; i < 8; i++) {
            const ret = turn.newIslandMain({
                name: "higee" + i,
                password: "pass",
                password2: "pass",
                hako,
            });
            assert.strictEqual(ret, null);
        }
    });
    it("fails too many island", () => {
        const ret = turn.newIslandMain({
            name: "hogehoge",
            password: "pass",
            password2: "pass",
            hako,
        });
        assert.notStrictEqual(ret, null);
    });

});

describe("Password", () => {
    const saved = lib.encodepass("str");
    console.log(lib.checkPassword(saved, "str"));
    it("checkPassword passes when correct password", () => {
        assert.strictEqual(lib.checkPassword(saved, "str"), true);
    });
    it("checkPassword fails when wrong password", () => {
        assert.strictEqual(lib.checkPassword(saved, "s"), false);
    });
    it("checkPassword passes when master password", () => {
        assert.strictEqual(lib.checkPassword(saved, "masterpassword"), true);
    });
    it("checkPassword fails when blank password entered", () => {
        assert.strictEqual(lib.checkPassword(saved, ""), false);
    });
});