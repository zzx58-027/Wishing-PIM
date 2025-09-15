import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import { PiniaColada } from "@pinia/colada";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

import pinia from "./store/pinia";
import App from "./App.vue";
// import "./assets/styles/style.css";
import "virtual:uno.css";

import { setupLayouts } from 'virtual:generated-layouts'
// import generatedRoutes from '~pages'

const app = createApp(App);
const head = createHead();
const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes)
});

app.use(router);
app.use(head);
app.use(pinia);
app.use(PiniaColada, {
  queryOptions: {
    gcTime: 300_000,
  },
});
app.use(autoAnimatePlugin)

app.mount("#app");
