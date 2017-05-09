import Vue from "vue";
import Component from "vue-class-component";

import {Command as Command} from "../../src/Island";
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
        addCommand: this.addCommand,
        overCommand: this.overCommand,
        delCommand: this.delCommand,
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
    public kind = 1;
    public x: number = 0;
    public y: number = 0;
    public arg = 0;
    public target;
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
        this.target = id;
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
    public selectCmdPos(i) {
        const commands = document.querySelectorAll(".commands > div a");
        for (const element of commands as any) {
            const e = element as HTMLElement;
            e.classList.remove("selected");
        }
        document.getElementsByClassName("command")[i - 1].classList.add("selected");
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
    private addCommand() {
        console.log(null);
        const cmds = this.island.commands as Command[];
        const head: Command[] = cmds.slice(0, this.number - 1);
        const tail: Command[] = cmds.slice(this.number, cmds.length - 1);
        const current: Command = {
            kind: this.kind,
            x: this.x,
            y: this.y,
            target: this.target,
            arg: this.arg,
        };
        console.log(head, tail, current);
        this.island.commands = [].concat(head, [current], tail);
        console.log(cmds);
        this.number++;
        this.selectCmdPos(this.number);
        this.$forceUpdate();
    }
    private overCommand() {
        console.log(null);
    }
    private delCommand() {
        console.log(null);
    }
}