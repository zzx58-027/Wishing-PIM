<template>
  <div>
    123
    {{ test }}
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../store/app';
const { test } = useAppStore()
</script>

<style scoped>
/* Component styles here */
</style>
