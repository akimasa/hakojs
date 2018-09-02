import Vue from "vue";
import VueRouter from "vue-router";

import Home from "./Home/Home.vue";
import Island from "./Island/Island.vue";
import Login from "./Login/Login.vue";
import NewIsland from "./NewIsland/NewIsland.vue";

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
            path: "/island/new",
            component: NewIsland,
            name: "newisland",
        },
        {
            path: "/island/:id",
            component: Island,
            name: "island",
        },
    ],
});