<script setup lang="ts">

import {useDark} from "@vueuse/core";

const isDark = useDark();

interface Props {
  delay?: number;
  duration?: number;
  blur?: string;
  yOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0.2,
  duration: 0.75,
  blur: "20px",
  yOffset: 20,
});
</script>

<template>
  <!--  <div class="bg-color-flow "></div>-->
    <BlurReveal
        :delay="props.delay"
        :duration="props.duration"
        :blur="props.blur"
        :y-offset="props.yOffset"
        class="p-8"
    >
      <div class="prose prose-coolgray dark:prose-invert m-auto px-5 box-content">
        <div
            class="prose m-auto mb-8"
        >
          <h2 class="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Hi there!  👋</h2>

          <h1 v-show="isDark"> </h1>
        </div>

        <article class="text-base ">
          <div class="slide-enter-content">
            <slot/>
          </div>

        </article>

      </div>
    </BlurReveal>



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
