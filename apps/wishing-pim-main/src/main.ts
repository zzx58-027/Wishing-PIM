import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const head = createHead();

app.use(router);
app.use(head);

app.mount("#app");
