<script setup>
import AppHeader from "./components/AppHeader.vue";

import {useRoute} from 'vue-router'
import {computed} from 'vue'
import {useDark} from "@vueuse/core";


const route = useRoute()
const isHomePage = computed(() => route.name === '/')
const isDark = useDark();

const raysColor = computed(() => (isDark.value ? '#ffffff' : '#ffffff'));
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
