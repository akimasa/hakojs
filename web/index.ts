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
class App extends Vue { }

const vm = new App();

vm.$mount("#app");
