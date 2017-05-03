import Vue from "vue";
import Component from "vue-class-component";

import IslandMap from "../IslandMap/IslandMap";
import * as Template from "./Island.html";

@Template
@Component<Island>({
    components: {
        IslandMap,
    },
    methods: {
        fetchData: this.fetchData,
    },
    watch: {
        $route: "fetchData",
    },
})
export default class Island extends Vue {
    public foo = "hige";
    public imgs = [];
    public lands = [];
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
            this.lands = island.lands;
            console.log(this.lands);
            this.$forceUpdate();
        };

        xhr.responseType = "json";
        xhr.open("get", "api/island/" + this.$route.params.id);
        xhr.send();
    }
    private landstr(data) {
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
        return "img/" + image;
    }
}