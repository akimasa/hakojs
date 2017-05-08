import Vue from "vue";
import Component from "vue-class-component";

import IslandHeader from "../IslandHeader/IslandHeader";
import IslandMap from "../IslandMap/IslandMap";
import utils from "../utils";
import * as Template from "./Island.html";

@Template
@Component<Island>({
    props: ["id"],
    components: {
        IslandMap,
        IslandHeader,
    },
    methods: {
        fetchDataByRoute: this.fetchDataByRoute,
        fetchDataByProp: this.fetchDataByProp,
        fetchData: this.fetchData,
    },
    watch: {
        $route: "fetchDataByRoute",
        id: "fetchDataByProp",
    },
})
export default class Island extends Vue {
    public foo = "hige";
    public imgs = [];
    public lands = [];
    public island;
    public id;
    public created() {
        if (this.$route.params.id) {
            this.fetchDataByRoute();
        } else {
            this.fetchDataByProp();
        }
    }
    public fetchData(id: string | number) {
        utils.getApi(`api/island/${id}`)
        .then((response) => {
            const island = response as any;
            this.foo = island.name;
            this.lands = island.lands;
            this.island = island;
            this.$forceUpdate();
        });
    }
    private fetchDataByRoute() {
        this.fetchData(this.$route.params.id);
    }
    private fetchDataByProp() {
        this.fetchData(this.id);
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