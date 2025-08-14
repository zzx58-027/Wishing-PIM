import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import { PiniaColada } from "@pinia/colada";
import pinia from "./store/pinia";

import App from "./App.vue";
import router from "./router";
// import "./assets/styles/style.css";
import "virtual:uno.css";

const app = createApp(App);
const head = createHead();

app.use(router);
app.use(head);
app.use(pinia);
app.use(PiniaColada, {
  queryOptions: {
    gcTime: 300_000,
  },
});

app.mount("#app");
