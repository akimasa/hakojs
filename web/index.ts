import Vue from "vue";
import Component from "vue-class-component";
import { mapActions } from "vuex";

import * as Template from "./index.html";
import router from "./router";

// import "./style.scss";

@Template
@Component<App>({
    router,
})
class App extends Vue {
    public hoge = "hoge";
 }

const vm = new App();

vm.$mount("#app");
