export default class {
    public static getSettings() {
        return JSON.parse(localStorage.getItem("settings"));
    }
}