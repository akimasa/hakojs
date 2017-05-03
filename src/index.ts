import * as bodyParser from "body-parser";
import * as express from "express";
import * as fs from "fs";
import Hakojima from "./Hakojima";

import * as zlib from "zlib";
const gunzip = zlib.createGunzip();
const buf = zlib.gunzipSync(fs.readFileSync(`${__dirname}/../src/test/test.json.gz`));
const hako = new Hakojima();
hako.load(buf.toString("utf-8"));

const app = express();

app.use(bodyParser.json());

// app.use("/", express.static(`${__dirname}/../static/`));
// app.use("/js/", express.static(`${__dirname}/../release/web/`));
app.use("/", express.static(`${__dirname}/../release/webpack/`));

app.get("/api/island/:id", (req, res, next) => {
    req.params.id = parseInt(req.params.id, 10);
    const island = hako.getIsland(req.params.id);
    if (island === undefined) {
        res.writeHead(404, { "Content-Type": "application/json;charset=utf-8" });
        res.end(JSON.stringify({ err: "Island not found." }));
    } else {
        res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
        res.end(JSON.stringify(island));
    }
});
app.post("/api/island/:id", (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    const island = hako.getIsland(id);
    if (island === undefined) {
        res.writeHead(404, { "Content-Type": "application/json;charset=utf-8" });
        res.end(JSON.stringify({ err: "Island not found." }));
    } else if (hako.authIsland(id, req.body.password) === false) {
        res.writeHead(403, { "Content-Type": "application/json;charset=utf-8" });
        res.end(JSON.stringify({ err: "Island Forbidden" }));
    } else {
        res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
        res.end();
    }
});

app.listen(3000);