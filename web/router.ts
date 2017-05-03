import Vue from "vue";
import VueRouter from "vue-router";

import Home from "./Home/Home";
import Island from "./Island/Island";
import Login from "./Login/Login";

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            path: "/",
            component: Home,
            name: "home",
        },
        {
            path: "/login",
            component: Login,
            name: "login",
        },
        {
            path: "/island/:id",
            component: Island,
            name: "island",
        },
    ],
});