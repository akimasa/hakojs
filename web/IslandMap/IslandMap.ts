import Vue from "vue";
import Component from "vue-class-component";

import { lands as Lands } from "../../src/lands";
import utils from "../utils";
import * as Template from "./IslandMap.html";

@Template
@Component<IslandMap>({
        props: ["lands"],
        computed: {
            landMap: function landMap() {
                if (this.lands === undefined) {
                    return;
                }
                const imgs = [];
                for (const y of this.lands) {
                    const line = [];
                    for (const x of y) {
                        line.push(this.landstr(x));
                    }
                    imgs.push(line);
                }
                return imgs;
        },
        islandSize: () => {
            const settings = utils.getSettings();
            return settings.islandSize;
        },
    },
})
export default class IslandMap extends Vue {
    public lands;
    private imgs;
    public setPoint(x, y) {
        this.$emit("setPoint", x, y);
    }
        private landstr(data) {
        let image = "";
        let alt = "";
        const kind = data.kind;
        const value = data.value;
        if (kind === Lands.Sea) {
            if (value === 1) {
                image = "land14.gif";
                alt = "海（浅瀬）";
            } else {
                image = "land0.gif";
            }
        } else if (kind === Lands.Waste) {
            if (value === 1) {
                image = "land13.gif";
            } else {
                image = "land1.gif";
            }
        } else if (kind === Lands.Plains) {
            image = "land2.gif";
        } else if (kind === Lands.Forest) {
            image = "land6.gif";
        } else if (kind === Lands.Town) {
            if (value < 3) {
                image = "land3.gif";
            } else if (value < 100) {
                image = "land4.gif";
            } else {
                image = "land5.gif";
            }

        } else if (kind === Lands.Base) {
            image = "land9.gif";
        } else if (kind === Lands.Mountain) {
            image = "land11.gif";
        } else {
            alt = kind;
        }
        return "img/" + image;
    }
}