import Vue from "vue";
import Component from "vue-class-component";

import { lands as Lands } from "../../src/lands";
import utils from "../utils";

@Component<IslandMap>({
        props: ["lands", "turn"],
        computed: {
            landMap: function landMap() {
                console.log(this.lands);
                const islandSize = utils.getSettings().islandSize;
                if (this.lands === undefined || this.lands.length !== islandSize) {
                    return;
                }
                const imgs = [];
                for (let x = 0; x < islandSize; x++) {
                    imgs[x] = [];
                    for (let y = 0; y < islandSize; y++) {
                        // xとyを逆転する必要あり
                        imgs[x][y] = this.landstr(this.lands[y][x]);
                    }
                }
                return imgs;
        },
        islandSize: () => {
            const settings = utils.getSettings();
            return settings.islandSize;
        },
    }
})
export default class IslandMap extends Vue {
    public lands;
    public turn;
    private imgs;
    public setPoint(x, y) {
        this.$emit("setPoint", x, y);
    }
    public showNavi(item) {
        document.getElementById("navi").innerHTML = item.alt;
    }
        private landstr(data) {
        let image = "";
        let alt = "";
        const kind = data.kind;
        const value = data.value;
        const settings = utils.getSettings();
        if (kind === Lands.Sea) {
            if (value === 1) {
                image = "land14.gif";
                alt = "海（浅瀬）";
            } else {
                image = "land0.gif";
                alt = "海";
            }
        } else if (kind === Lands.Waste) {
            alt = "荒地";
            if (value === 1) {
                image = "land13.gif";
            } else {
                image = "land1.gif";
            }
        } else if (kind === Lands.Plains) {
            image = "land2.gif";
            alt = "平地";
        } else if (kind === Lands.Forest) {
            image = "land6.gif";
            if (value > 0) {
                alt = `森(${value + settings.unitTree})`;
            } else {
                alt = "森";
            }
        } else if (kind === Lands.Town) {
            if (value < 3) {
                image = "land3.gif";
                alt = "村";
            } else if (value < 100) {
                image = "land4.gif";
                alt = "町";
            } else {
                image = "land5.gif";
                alt = "都市";
            }
            alt += `(${value}${settings.unitPop})`;
        } else if (kind === Lands.Base) {
            image = "land9.gif";
            alt = `ミサイル基地 (レベル /経験値 ${value})`;
        } else if (kind === Lands.Mountain) {
            if (value > 0) {
                image = "land15.gif";
                alt = `"山(採掘場${value}0${settings.unitPop}規模)`;
            } else {
                image = "land11.gif";
                alt = "山";
            }
        } else if (kind === Lands.Farm) {
            image = "land7.gif";
            alt = `農場(${value}0${settings.unitPop}規模)`;
        } else if (kind === Lands.Factory) {
            image = "land8.gif";
            alt = `工場(${value}0${settings.unitPop}規模)`;
        } else if (kind === Lands.Sbase) {
            image = "land12.gif";
            alt = `海底基地 (レベル /経験値 ${value})`;
        } else if (kind === Lands.Defence || kind === Lands.Haribote) {
            image = "land10.gif";
            if (kind === Lands.Defence) {
                alt = "防衛施設";
            } else {
                alt = "ハリボテ";
            }
        } else if (kind === Lands.Oil) {
            image = "land16.gif";
            alt = "海底油田";
        } else if (kind === Lands.Monument) {
            image = settings.monumentImage[value];
            alt = settings.monumentName[value];
        } else if (kind === Lands.Monster) {
            const monsterKind = Math.floor(value / 10);
            image = settings.monsterImage[monsterKind];
            alt = settings.monsterName[monsterKind];
            const special = settings.monsterSpecial[monsterKind];
            if (((special === 3) && ((this.turn % 2) === 1) ||
            ((special === 4) && ((this.turn % 2) === 0)))) {
                image = settings.monsterImage2[monsterKind];
            }
        } else {
            alt = kind;
        }
        return {image: "img/" + image, alt};
    }
}