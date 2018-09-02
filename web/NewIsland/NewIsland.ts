import Vue from "vue";
import Component from "vue-class-component";

import Island from "../Island/Island.vue";
import utils from "../utils";

@Component<NewIsland>({
    components: {
        Island,
    },
})
export default class NewIsland extends Vue {
    public id;
    public err;
    public name;
    public password;
    public created() {
        this.id = this.$route.params.id;
        this.err = this.$route.params.err;
        this.name = this.$route.params.name;
        this.password = this.$route.params.password;
        this.$forceUpdate();
    }
}