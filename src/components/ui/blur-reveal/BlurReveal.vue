<script setup lang="ts">
import { Motion } from "motion-v";
import type { VNode } from "vue";
import { onMounted, ref, useSlots, watchEffect } from "vue";

interface Props {
  duration?: number;
  delay?: number;
  blur?: string;
  yOffset?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1,
  delay: 2,
  blur: "20px",
  yOffset: 20,
});

const slots = useSlots();

const children = ref<VNode[]>([]);

onMounted(() => {
  // This will reactively capture all content provided in the default slot
  watchEffect(() => {
    children.value = slots.default ? slots.default() : [];
  });
});

function getInitial() {
  return {
    opacity: 0,
    filter: `blur(${props.blur})`,
    y: props.yOffset,
  };
}

function getAnimate() {
  return {
    opacity: 1,
    filter: `blur(0px)`,
    y: 0,
  };
}
</script>

<template>
  <div :class="props.class">
    <Motion
      v-for="(child, index) in children"
      :key="index"
      as="div"
      :initial="getInitial()"
      :while-in-view="getAnimate()"
      :transition="{
        duration: props.duration,
        ease: 'easeInOut',
        delay: props.delay * index,
      }"
    >
      <component :is="child" />
    </Motion>
  </div>
</template>
