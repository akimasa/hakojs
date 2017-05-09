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
    methods: {
        comClick: this.comClick,
    },
})
export default class Login extends Vue {
    public commands;
    public island;
    public islands;
    public lands;
    public password;
    public settings;
    public number = 1;
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
        Promise.all([
            utils.postApi(`api/island/${id}/login`, { password }),
            utils.getApi("api/commands"),
            utils.getApi("api/islands")])
            .then((responses) => {
                localStorage.setItem("password", password);
                localStorage.setItem("islandid", id);
                this.lands = (responses[0] as any).lands;
                this.island = responses[0];
                this.commands = responses[1];
                this.islands = (responses[2] as any).islands;
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
    private comClick(n, evt) {
        console.log(n, evt);
        const commands = document.querySelectorAll(".commands > div a");
        for (const element of commands as any) {
            const e = element as HTMLElement;
            e.classList.remove("selected");
        }
        evt.target.classList.add("selected");
        this.number = n + 1;
        // this.$forceUpdate();
    }
}