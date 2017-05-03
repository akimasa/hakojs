import Vue from "vue";
import Component from "vue-class-component";

import * as Template from "./IslandMap.html";

@Template
@Component({
    props: ["imgs", "foo"],
})
export default class IslandMap extends Vue {  }