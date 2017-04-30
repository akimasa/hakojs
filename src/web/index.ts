console.log("this is index.ts");
const body = document.getElementsByTagName("body")[0];
const island = [[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 2, value: 1 },
{ land: 0, value: 1 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 1, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 0, value: 0 },
{ land: 2, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 0, value: 0 },
{ land: 3, value: 5 },
{ land: 4, value: 5 },
{ land: 4, value: 5 },
{ land: 2, value: 1 },
{ land: 2, value: 1 },
{ land: 0, value: 1 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 2, value: 0 },
{ land: 1, value: 0 },
{ land: 1, value: 0 },
{ land: 1, value: 0 },
{ land: 7, value: 0 },
{ land: 2, value: 1 },
{ land: 2, value: 1 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 1, value: 0 },
{ land: 4, value: 5 },
{ land: 9, value: 0 },
{ land: 1, value: 0 },
{ land: 1, value: 0 },
{ land: 2, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 3, value: 5 },
{ land: 7, value: 0 },
{ land: 1, value: 0 },
{ land: 4, value: 5 },
{ land: 2, value: 0 },
{ land: 2, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 2, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 1, value: 0 },
{ land: 0, value: 1 },
{ land: 1, value: 0 },
{ land: 2, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 2, value: 0 },
{ land: 1, value: 0 },
{ land: 1, value: 0 },
{ land: 0, value: 1 },
{ land: 0, value: 0 },
{ land: 0, value: 1 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }],
[{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 },
{ land: 0, value: 0 }]]
    ;
function main() {
    const xbar12 = document.createElement("img");
    xbar12.src = "img/xbar12.gif";
    body.appendChild(xbar12);
    let br = document.createElement("br");
    body.appendChild(br);
    for (let y = 0; y < 12; y++) {
        if ((y % 2) === 0) {
            const space = document.createElement("img");
            space.src = "img/space" + y + ".gif";
            body.appendChild(space);
        }
        for (let x = 0; x < 12; x++) {
            landstr(island[x][y]);
        }
        if ((y % 2) === 1) {
            const space = document.createElement("img");
            space.src = "img/space" + y + ".gif";
            body.appendChild(space);
        }
        br = document.createElement("br");
        body.appendChild(br);
    }
}
function landstr(data) {
    let image = "";
    let alt = "";
    if (data.land === 0) {
        if (data.value === 1) {
            image = "land14.gif";
            alt = "海（浅瀬）";
        } else {
            image = "land0.gif";
        }
    } else if (data.land === 1) {
        if (data.value === 1) {
            image = "land13.gif";
        } else {
            image = "land1.gif";
        }
    } else if (data.land === 2) {
        image = "land2.gif";
    } else if (data.land === 4) {
        image = "land6.gif";
    } else if (data.land === 3) {
        if (data.value < 3) {
            image = "land3.gif";
        } else if (data.value < 100) {
            image = "land4.gif";
        } else {
            image = "land5.gif";
        }

    } else if (data.land === 7) {
        image = "land9.gif";
    } else if (data.land === 9) {
        image = "land11.gif";
    } else {
        alt = data.land;
    }
    const a = document.createElement("img");
    a.src = "img/" + image;
    a.alt = alt;
    a.width = 32;
    a.height = 32;
    a.border = "0";
    body.appendChild(a);
}
main();