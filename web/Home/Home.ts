import Vue from "vue";
import Component from "vue-class-component";
import { Getter } from "vuex";

import * as Template from "./Home.html";
@Template
@Component
export default class Home extends Vue {
    public islands;
    public password;
    public islandid;
    public created() {
        this.password = localStorage.getItem("password");
        this.islandid = localStorage.getItem("islandid");
        this.fetchData();
    }
    public fetchData() {
        const xhr = new XMLHttpRequest();
        xhr.onload = (e) => {
            this.islands = xhr.response;
            this.$forceUpdate();
        };

        xhr.responseType = "json";
        xhr.open("get", "api/islands");
        xhr.send();
    }
    public goOwner() {
        const xhr = new XMLHttpRequest();
        xhr.onload = (e) => {
            console.log(xhr.response);
        };

        xhr.responseType = "json";
        xhr.open("post", `api/island/${this.islandid}/login`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({password: this.password}));
        localStorage.setItem("password", this.password);
        localStorage.setItem("islandid", this.islandid);
    }
}