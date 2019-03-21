import Vue from "vue";
import Component from "vue-class-component";

import {Command as Command} from "../../src/Island";
import IslandMap from "../IslandMap/IslandMap.vue";
import utils from "../utils";

@Component<Login>({
    components: {
        IslandMap,
    },

})
export default class Login extends Vue {
    public commands;
    public island;
    public islandsNames;
    public lands;
    public password;
    public settings;
    public number = 1;
    public kind = 1;
    public x: number = 0;
    public y: number = 0;
    public arg = 0;
    public target: number;
    public commandsDirty = false;
    public turn;
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
        this.target = parseInt(id, 10);
        this.password = password;
        Promise.all([
            utils.postApi(`api/island/${id}/login`, { password }),
            utils.getApi("api/commands"),
            utils.getApi("api/islands/names")])
            .then((responses) => {
                localStorage.setItem("password", password);
                localStorage.setItem("islandid", id);
                const [island, turn] = [(responses[0] as any).island, (responses[0] as any).turn];
                this.lands = island.lands;
                this.island = island;
                this.turn = turn;
                this.commands = responses[1];
                this.islandsNames = responses[2];
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
        this.number = i;
    }
    public getIslandNameFromId(id) {
        id = parseInt(id, 10);
        const island = this.islandsNames.find((ele) => ele.id === id);
        return island.name;
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
    private addCommand() {
        this.commandsDirty = true;
        const cmds = this.island.commands as Command[];
        const head: Command[] = cmds.slice(0, this.number - 1);
        const tail: Command[] = cmds.slice(this.number - 1, cmds.length - 1);
        const current: Command = {
            kind: this.kind,
            x: this.x,
            y: this.y,
            target: this.target,
            arg: this.arg,
        };
        this.island.commands = [].concat(head, [current], tail);
        this.number++;
        if (this.number > cmds.length) {
            this.number = cmds.length;
        }
        this.selectCmdPos(this.number);
        this.$forceUpdate();
    }
    private overCommand() {
        this.commandsDirty = true;
        this.island.commands[this.number - 1] = {
            kind: this.kind,
            x: this.x,
            y: this.y,
            target: this.target,
            arg: this.arg,
        };
        this.$forceUpdate();
    }
    private delCommand() {
        this.commandsDirty = true;
        const cmds = this.island.commands as Command[];
        const head: Command[] = cmds.slice(0, this.number - 1);
        const tail: Command[] = cmds.slice(this.number, cmds.length);
        const last: Command = {
            kind: this.commands.donothing.id,
            x: 0,
            y: 0,
            target: 0,
            arg: 0,
        };
        this.island.commands = [].concat(head, tail, [last]);
        this.$forceUpdate();
    }
    private getCommandName(id) {
        for (const ele in this.commands) {
            if (this.commands[ele].id === id) {
                return this.commands[ele].name;
            }
        }
    }
    private isMissile(kind) {
        if (kind === 31 ||
            kind === 32 ||
            kind === 33 ||
            kind === 34 ||
            kind === 35) {
            return true;
        } else {
            return false;
        }
    }
    private submitCommand() {
        utils.postApi(`api/island/${this.island.id}/command/update`, {
            password: this.password,
            commands: this.island.commands,
        }).then(() => {
            this.commandsDirty = false;
        });
    }
}