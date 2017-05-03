import Vue from "vue";
import Component from "vue-class-component";

import IslandMap from "../IslandMap/IslandMap";
import * as Template from "./Island.html";

@Template
@Component<Island>({
    components: {
        IslandMap,
    },
})
export default class Island extends Vue {
    public foo = "hige";
    public created() {
        console.log("created");
        this.fetchData();
    }
    public fetchData() {
        console.log(this.$route.params.id);
        this.foo = this.$route.params.id;
        const xhr = new XMLHttpRequest();
        xhr.onload = (e) => {
            console.log(xhr.response);
            const island = xhr.response;
            this.foo = island.name;
            this.$forceUpdate();
        };

        xhr.responseType = "json";
        xhr.open("get", "api/island/" + this.$route.params.id);
        xhr.send();
    }
}