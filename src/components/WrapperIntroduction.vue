<script setup lang="ts">

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
    <BlurReveal
        :delay="props.delay"
        :duration="props.duration"
        :blur="props.blur"
        :y-offset="props.yOffset"
        class="p-8"
    >
      <div class="prose m-auto px-5 box-content">
        <div
            class="prose m-auto mb-8"
        >
          <h2 class="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Hi there!  👋</h2>

        </div>

        <article class="text-base ">
          <div class="slide-enter-content">
            <slot/>
          </div>

        </article>

      </div>
    </BlurReveal>



</template>
