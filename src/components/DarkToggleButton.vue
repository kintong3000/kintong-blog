<script setup lang="ts">
import {useDark, useToggle} from '@vueuse/core'
import Dark from "~/components/icons/dark.vue";
// @ts-ignore
import {IconsDark, IconsLight} from "#components";

const isDark = useDark()
// const toggleDark = useToggle(isDark)

const value1 = ref(isDark.value)
// const value1 = ref(true)


console.log(value1.value)
const value2 = ref(true)

// onMounted(() => {
//   value1.value = !isDark.value
//
//   console.log(value1.value)
// // 在客户端挂载时，用 isDark.value 更新 value1
// })
function toggleDark(event: MouseEvent) {
  // @ts-expect-error experimental API
  const isAppearanceTransition = document.startViewTransition
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    isDark.value = !isDark.value
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
  )
  // @ts-ignore: Transition API
  const transition = (document as any).startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  transition.ready
      .then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]
        document.documentElement.animate(
            {
              clipPath: isDark.value
                  ? [...clipPath].reverse()
                  : clipPath,
            },
            {
              duration: 400,
              easing: 'ease-out',
              pseudoElement: isDark.value
                  ? '::view-transition-old(root)'
                  : '::view-transition-new(root)',
            },
        )
      })
}

</script>

<template>
  <div class="flex	">
<!--      <button-->
<!--          class="bg-[#42b883] rounded border-b-2 border-green-900 text-white text-sm px-2 pt-1.5 pb-1 inline-block !outline-none hover:bg-opacity-85"-->
<!--          @click="toggleDark"-->
<!--      >-->
<!--        <div class="flex">-->

<!--          <span class="mr-1 ml-2">{{ isDark ? 'Dark' : 'Light' }}</span>-->
<!--        </div>-->
<!--      </button>-->
    <client-only>
      <div @click="toggleDark">

        <el-switch
            v-model="value1"
            style="--el-switch-on-color: 	#3C4744; --el-switch-off-color: #D3D3D3;"
            :active-action-icon="IconsDark"
            :inactive-action-icon="IconsLight"
        />
      </div>
    </client-only>
  </div>
</template>

<style>

</style>
