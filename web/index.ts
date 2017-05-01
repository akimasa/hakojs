import * as Vue from "vue";
import Component from "vue-class-component";
import { mapActions } from "vuex";

import * as Template from "./index.html";

// import "./style.scss";

@Template
@Component<App>({ })
class App extends Vue {}

const vm = new App();

vm.$mount("#app");
