import Vue from "vue";
import Component from "vue-class-component";

import IslandHeader from "../IslandHeader/IslandHeader";
import IslandMap from "../IslandMap/IslandMap";
import utils from "../utils";
import * as Template from "./Island.html";

@Template
@Component<Island>({
    components: {
        IslandMap,
        IslandHeader,
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
    public island;
    public created() {
        this.fetchData();
    }
    public fetchData() {
        this.foo = this.$route.params.id;
        utils.getApi(`api/island/${this.$route.params.id}`)
        .then((response) => {
            const island = response as any;
            this.foo = island.name;
            this.lands = island.lands;
            this.island = island;
            this.$forceUpdate();
        });
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