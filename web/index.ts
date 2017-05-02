import Vue from "vue";
import Component from "vue-class-component";
import { mapActions } from "vuex";

import * as Template from "./index.html";

// import "./style.scss";

@Template
@Component
class App extends Vue {
    public hoge = [1, 2, 3];
 }

const vm = new App();

vm.$mount("#app");
