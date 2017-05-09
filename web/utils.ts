export default class {
    public static getSettings() {
        return JSON.parse(localStorage.getItem("settings"));
    }
    public static getApi(url: string) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = (e) => {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.response);
                }
            };

            xhr.responseType = "json";
            xhr.open("get", url);
            xhr.send();
        });
    }
    public static postApi(url: string, data?) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = (e) => {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.response);
                }
            };

            xhr.responseType = "json";
            xhr.open("post", url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(data));
        });
    }
    public static islandInfo(arg: {island, settings}) {
        const ret: {farm, factory, mountain} = {farm: "保有せず", factory: "保有せず", mountain: "保有せず"};
        if (arg.island) {
            if (arg.island.farm > 0) {
                ret.farm = `${arg.island.farm}0${arg.settings.unitPop}`;
            }
            if (arg.island.factory > 0) {
                ret.factory = `${arg.island.factory}0${arg.settings.unitPop}`;
            }
            if (arg.island.mountain > 0) {
                ret.mountain = `${arg.island.mountain}0${arg.settings.unitPop}`;
            }
        }
        return ret;
    }
}