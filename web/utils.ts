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
            xhr.send(data);
        });
    }
}