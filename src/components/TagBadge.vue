<script setup lang="ts">
const { tag } = defineProps<{
  tag: string
}>()

// 按标签名哈希选取色相，同名标签始终同色；只用预选的色相，避开土黄、脏绿等难看的颜色
const hues = [25, 60, 145, 185, 230, 270, 320, 350]
const hue = computed(() => {
  let hash = 0
  for (const char of tag)
    hash = (hash * 31 + char.codePointAt(0)!) | 0
  return hues[Math.abs(hash) % hues.length]
})
</script>

<template>
  <!-- 亮度和饱和度固定、只换色相，各颜色视觉轻重一致 -->
  <Badge
    as="span"
    variant="secondary"
    class="bg-[oklch(0.95_0.035_var(--tag-hue))] text-[oklch(0.45_0.11_var(--tag-hue))] dark:bg-[oklch(0.3_0.05_var(--tag-hue))] dark:text-[oklch(0.85_0.08_var(--tag-hue))]"
    :style="{ '--tag-hue': hue }"
  >
    {{ tag }}
  </Badge>
</template>
