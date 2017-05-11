import Vue from "vue";
import Component from "vue-class-component";

import utils from "../utils";
import * as Template from "./IslandHeader.html";

@Template
@Component<IslandHeader>({
        props: ["island"],
        watch: {
            island: "watchIsland",
        },
})
export default class IslandHeader extends Vue {
    public island;
    public settings;
    public farm = "保有せず";
    public factory = "保有せず";
    public mountain = "保有せず";
    public created() {
        this.settings = utils.getSettings();
    }
    public watchIsland() {
        if (this.island) {
            if (this.island.farm > 0) {
                this.farm = `${this.island.farm}0${this.settings.unitPop}`;
            }
            if (this.island.factory > 0) {
                this.factory = `${this.island.factory}0${this.settings.unitPop}`;
            }
            if (this.island.mountain > 0) {
                this.mountain = `${this.island.mountain}0${this.settings.unitPop}`;
            }
        }
        this.$forceUpdate();
    }
 }