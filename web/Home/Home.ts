import Vue from "vue";
import Component from "vue-class-component";
import { Getter } from "vuex";

import utils from "../utils";
import * as Template from "./Home.html";
@Template
@Component
export default class Home extends Vue {
    public islands;
    public password;
    public islandid;
    public newislandname;
    public newislandpassword;
    public newislandpassword2;
    public created() {
        this.password = localStorage.getItem("password");
        this.islandid = localStorage.getItem("islandid");
        this.fetchData();
    }
    public fetchData() {
        utils.getApi("api/islands").then((response) => {
            this.islands = response;
            localStorage.setItem("settings", JSON.stringify(this.islands.settings));
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
}