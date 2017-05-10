import Vue from "vue";
import Component from "vue-class-component";
import { Getter } from "vuex";

import utils from "../utils";
import * as Template from "./Home.html";
@Template
@Component<Home>({
    methods: {
        getRemainingTime: this.getRemainingTime,
    },
})
export default class Home extends Vue {
    public islands;
    public password;
    public islandid;
    public newislandname;
    public newislandpassword;
    public newislandpassword2;
    public settings;
    public islandNextTime;
    public created() {
        this.password = localStorage.getItem("password");
        this.islandid = localStorage.getItem("islandid");
        this.fetchData();
    }
    public fetchData() {
        utils.getApi("api/islands").then((response) => {
            this.islands = response;
            this.islandNextTime = new Date(this.islands.islandLastTime + this.islands.settings.unitTime * 1000);
            localStorage.setItem("settings", JSON.stringify(this.islands.settings));
            console.log(this.islands.islands.length);
            for (const island of this.islands.islands) {
                const ret = utils.islandInfo({island, settings: this.islands.settings});
                island.farm = ret.farm;
                island.factory = ret.factory;
                island.mountain = ret.mountain;
            }
            setInterval(() => {
                document.getElementById("remainingtime").innerText = this.getRemainingTime();
            }, 1000);
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
}