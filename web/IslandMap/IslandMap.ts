import Vue from "vue";
import Component from "vue-class-component";

import * as Template from "./IslandMap.html";

@Template
@Component<IslandMap>({
        props: ["foo", "lands"],
        computed: {
            landMap: function landMap() {
                if (this.lands === undefined) {
                    return;
                }
                let indy = 0;
                const imgs = [];
                for (const y of this.lands) {
                    console.log(y);
                    if (imgs[indy] === undefined) {
                        imgs[indy] = [];
                    }
                    for (const x of y) {
                        imgs[indy].push(this.landstr(x));
                    }
                    indy++;
                    return imgs;
            }
        },
    },
})
export default class IslandMap extends Vue {
    public lands;
    private imgs;
        private landstr(data) {
        let image = "";
        let alt = "";
        if (data.kind === 0) {
            if (data.value === 1) {
                image = "land14.gif";
                alt = "海（浅瀬）";
            } else {
                image = "land0.gif";
            }
        } else if (data.kind === 1) {
            if (data.value === 1) {
                image = "land13.gif";
            } else {
                image = "land1.gif";
            }
        } else if (data.kind === 2) {
            image = "land2.gif";
        } else if (data.kind === 4) {
            image = "land6.gif";
        } else if (data.kind === 3) {
            if (data.value < 3) {
                image = "land3.gif";
            } else if (data.value < 100) {
                image = "land4.gif";
            } else {
                image = "land5.gif";
            }

        } else if (data.kind === 7) {
            image = "land9.gif";
        } else if (data.kind === 9) {
            image = "land11.gif";
        } else {
            alt = data.kind;
        }
        return "img/" + image;
    }
 }