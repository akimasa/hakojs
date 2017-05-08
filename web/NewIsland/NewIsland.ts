import Vue from "vue";
import Component from "vue-class-component";

import Island from "../Island/Island";
import utils from "../utils";
import * as Template from "./NewIsland.html";

@Template
@Component<NewIsland>({
    components: {
        Island,
    },
})
export default class NewIsland extends Vue {
    public id;
    public err;
    public name;
    public created() {
        this.id = this.$route.params.id;
        this.err = this.$route.params.err;
        this.name = this.$route.params.name;
        this.$forceUpdate();
    }
}