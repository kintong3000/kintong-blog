<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
</script>

<template>
  <div class="font-sans relative">
    <AppHeader/>
    <div>
      <main class=" py-0 px-0 m-auto overflow-x-hidden   min-h-screen">
        <RouterView/>
      </main>
    </div>
  </div>
</template>

<style>

html {
  scroll-behavior: smooth;
}

</style>
