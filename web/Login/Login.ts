import Vue from "vue";
import Component from "vue-class-component";

import IslandMap from "../IslandMap/IslandMap";
import * as Template from "./Login.html";

@Template
@Component<Login>({
    components: {
        IslandMap,
    },
})
export default class Login extends Vue {
    public lands;
    public created() {
        let id = this.$route.params.id;
        let password = this.$route.params.password;
        if (id === undefined) {
            id = localStorage.getItem("islandid");
        }
        if (password === undefined) {
            password = localStorage.getItem("password");
        }
        const xhr = new XMLHttpRequest();
        xhr.onload = (e) => {
            console.log(xhr.response);
            if (xhr.status === 200) {
                localStorage.setItem("password", password);
                localStorage.setItem("islandid", id);
                this.lands = xhr.response.lands;
                this.$forceUpdate();
            }
        };

        xhr.responseType = "json";
        xhr.open("post", `api/island/${id}/login`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ password }));

    }
}