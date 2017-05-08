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
    public commands;
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
        Promise.all([utils.postApi(`api/island/${id}/login`, { password }),
        utils.getApi("api/commands")])
            .then((responses) => {
                localStorage.setItem("password", password);
                localStorage.setItem("islandid", id);
                this.lands = (responses[0] as any).lands;
                this.island = responses[0];
                this.commands = responses[1];
                this.$forceUpdate();
            });
    }
    public setPoint(x, y) {
        this.x = x;
        this.y = y;
        this.$forceUpdate();
    }
    private commandStr(item) {
        let cost = item.cost;
        if (cost === 0) {
            cost = "無料";
        } else if (cost < 0) {
            cost = - cost;
            cost += this.settings.unitFood;
        } else {
            cost += this.settings.unitMoney;
        }
        return `${item.name}(${cost})`;
    }
}