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
}