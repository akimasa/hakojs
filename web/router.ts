import Vue from "vue";
import VueRouter from "vue-router";

import Home from "./Home/Home";
import Island from "./Island/Island";

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            path: "/",
            component: Home,
            name: "home",
        },
        {
            path: "/island/:id",
            component: Island,
        },
    ],
});