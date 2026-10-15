<script setup lang="ts">

import {useDark} from "@vueuse/core";

const isDark = useDark();

</script>

<template>
  <!--  <div class="bg-color-flow "></div>-->

  <div class="prose prose-coolgray dark:prose-invert m-auto ">
    <div
        class="prose m-auto mb-8"
    >
      <h1>Hi there!</h1>
      <h1>
        <span>I am </span>
        <span class="mb-0 slide-enter-50 clip">Kintong Cheung</span>
      </h1>
      <h1 v-show="isDark"> </h1>
    </div>

    <article class="text-base ">
      <div class="slide-enter-content">
        <slot/>
      </div>

    </article>

  </div>

</template>

<style scoped>
.bg-color-flow {
  position: absolute;
  background-image: var(--vp-home-hero-image-background-image);
  border-radius: 50%;
  width: 192px;
  height: 192px;
  filter: var(--vp-home-hero-image-filter);
  top: 150px;
  left: 600px;
  /*rtl:ignore*/
  //left: 50%;
}

.clip {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
}


</style>
