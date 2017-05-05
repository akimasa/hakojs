import Vue from "vue";
import Component from "vue-class-component";

import IslandMap from "../IslandMap/IslandMap";
import utils from "../utils";
import * as Template from "./Login.html";

@Template
@Component<Login>({
    components: {
        IslandMap,
    },
})
export default class Login extends Vue {
    public island;
    public lands;
    public password;
    public settings;
    public x: number = 0;
    public y: number = 0;
    public created() {
        let id = this.$route.params.id;
        let password = this.$route.params.password;
        this.settings = utils.getSettings();
        this.password = password;
        if (id === undefined) {
            id = localStorage.getItem("islandid");
        }
        if (password === undefined) {
            password = localStorage.getItem("password");
        }
        utils.postApi(`api/island/${id}/login`, JSON.stringify({ password }))
            .then((response) => {
                localStorage.setItem("password", password);
                localStorage.setItem("islandid", id);
                this.lands = (response as any).lands;
                this.island = response;
                this.$forceUpdate();
            });
    }
    public setPoint(x, y) {
        this.x = x;
        this.y = y;
        this.$forceUpdate();
    }
}