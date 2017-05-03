import Vue from "vue";
import Component from "vue-class-component";
import { Getter } from "vuex";

import * as Template from "./Home.html";
@Template
@Component
export default class Home extends Vue {
    public islands;
    public created() {
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
}