import { defineStore } from "pinia";

export const useAppStore = defineStore("app", () => {
    const test = ref(123)
    return {
        test
    }
});
