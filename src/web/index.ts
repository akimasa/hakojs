console.log("this is index.ts");
const body = document.getElementsByTagName("body")[0];

function main(num: number) {
    body.innerHTML = "";
    const xhr = new XMLHttpRequest();
    xhr.onload = (e) => {
        console.log(xhr.response);
        const island = xhr.response.lands;
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
    };
    xhr.responseType = "json";
    xhr.open("get", "api/island/" + num);
    xhr.send();

}
function landstr(data) {
    let image = "";
    let alt = "";
    if (data.kind === 0) {
        if (data.value === 1) {
            image = "land14.gif";
            alt = "海（浅瀬）";
        } else {
            image = "land0.gif";
        }
    } else if (data.kind === 1) {
        if (data.value === 1) {
            image = "land13.gif";
        } else {
            image = "land1.gif";
        }
    } else if (data.kind === 2) {
        image = "land2.gif";
    } else if (data.kind === 4) {
        image = "land6.gif";
    } else if (data.kind === 3) {
        if (data.value < 3) {
            image = "land3.gif";
        } else if (data.value < 100) {
            image = "land4.gif";
        } else {
            image = "land5.gif";
        }

    } else if (data.kind === 7) {
        image = "land9.gif";
    } else if (data.kind === 9) {
        image = "land11.gif";
    } else {
        alt = data.kind;
    }
    const a = document.createElement("img");
    a.src = "img/" + image;
    a.alt = alt;
    a.width = 32;
    a.height = 32;
    a.border = "0";
    body.appendChild(a);
}
main(1);