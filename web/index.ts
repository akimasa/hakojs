import Vue from "vue";
import Component from "vue-class-component";
import { mapActions } from "vuex";

import App from "./App/App.vue"
import router from "./router";

// import "./style.scss";

new Vue({
    router,
    el: '#app',
    render: (h) => h(App)
})
