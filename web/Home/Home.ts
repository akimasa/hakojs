import Vue from "vue";
import Component from "vue-class-component";
import { Getter } from "vuex";

import utils from "../utils";

@Component
export default class Home extends Vue {
    public islands = null;
    public password;
    public islandid;
    public newislandname = null;
    public newislandpassword = null;
    public newislandpassword2 = null;
    public settings;
    public islandNextTime;
    public remainingTimeTimer;
    public log = null;
    public created() {
        this.password = localStorage.getItem("password");
        this.islandid = localStorage.getItem("islandid");
        this.fetchData();
    }
    public destroyed() {
        clearInterval(this.remainingTimeTimer);
    }
    public fetchData() {
        utils.getApi("api/islands").then((response) => {
            this.islands = response;
            this.islandNextTime = new Date(this.islands.islandLastTime + this.islands.settings.unitTime * 1000);
            localStorage.setItem("settings", JSON.stringify(this.islands.settings));
            for (const island of this.islands.islands) {
                const ret = utils.islandInfo({island, settings: this.islands.settings});
                island.farm = ret.farm;
                island.factory = ret.factory;
                island.mountain = ret.mountain;
            }
            if (this.remainingTimeTimer) {
                clearInterval(this.remainingTimeTimer);
            }
            this.remainingTimeTimer = setInterval(() => {
                document.getElementById("remainingtime").innerText = this.getRemainingTime();
            }, 1000);
            this.$forceUpdate();
        });
        utils.getApi("api/logs").then((response) => {
            console.log(response);
            this.log = response;
            this.$forceUpdate();
        });
    }
    public goOwner() {
        this.$router.push({name: "login", params: {
            password: this.password,
            id: this.islandid,
        }});

    }
    public newIsland() {
        utils.postApi("api/island/new", {
            name: this.newislandname,
            password: this.newislandpassword,
            password2: this.newislandpassword2,
        }).then((response) => {
            this.$router.push({
                name: "newisland", params: {
                    name: this.newislandname,
                    id: (response as any).id,
                    password: this.newislandpassword,
                },
            });
        }).catch((response) => {
            this.$router.push({
                name: "newisland", params: response,
            });
        });
    }
    public getRemainingTime() {
        let remaining = this.islandNextTime - new Date().getTime();
        if (remaining < 0) {
            remaining = 0;
        }
        remaining = Math.floor(remaining / 1000);
        const days = Math.floor(remaining / 60 / 60 / 24);
        remaining -= days * 60 * 60 * 24;
        const hours = Math.floor(remaining / 60 / 60);
        remaining -= hours * 60 * 60;
        const minutes = Math.floor(remaining / 60);
        remaining -= minutes * 60;
        const seconds = remaining;
        return `(残り ${days}日${hours}時間${minutes}分${seconds}秒)`;
    }
    public debugButton() {
        utils.getApi("api/debug")
        .then(() => {
           this.fetchData();
        });
    }
}