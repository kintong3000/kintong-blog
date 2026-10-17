<script setup>
import AppHeader from "./components/AppHeader.vue";
</script>

<template>
  <div class="font-sans text-gray-700 dark:text-gray-200 relative ">
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
