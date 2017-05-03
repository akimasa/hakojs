import Vue from "vue";
import Component from "vue-class-component";

import * as Template from "./IslandMap.html";

@Template
@Component({
    props: ["hako"],
})
export default class IslandMap extends Vue {}