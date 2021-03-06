import Vue from "vue";
import Component from "vue-class-component";

import IslandHeader from "../IslandHeader/IslandHeader.vue";
import IslandMap from "../IslandMap/IslandMap.vue";
import utils from "../utils";

@Component<Island>({
    props: ["id", "password"],
    components: {
        IslandMap,
        IslandHeader,
    },

    watch: {
        $route: "fetchDataByRoute",
        id: "fetchDataByProp",
    }
})
export default class Island extends Vue {
    public lands = [];
    public island = null;
    public turn = null;
    public password;
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
        .then((response: any) => {
            const [island, turn] = [response.island, response.turn];
            this.lands = island.lands;
            this.island = island;
            this.turn = turn;
            this.$forceUpdate();
        });
    }
    private fetchDataByRoute() {
        if (this.password) {
            utils.postApi(`api/island/${this.id}/login`, { password: this.password })
                .then((response: any) => {
                    const [island, turn] = [response.island, response.turn];
                    this.lands = island.lands;
                    this.island = island;
                    this.turn = turn;
                    this.$forceUpdate();
                });
        } else {
            this.fetchData(this.$route.params.id);
        }
    }
    private fetchDataByProp() {
        this.fetchData(this.id);
    }
}