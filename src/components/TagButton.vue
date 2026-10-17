<script setup lang="ts">
defineProps<{
  options: string[]
}>()

const selected = defineModel<string[]>({default: () => []})
</script>

<template>
  <ToggleGroup
    v-model="selected"
    type="multiple"
    variant="outline"
    size="sm"
    :spacing="2"
    class="flex-wrap justify-center"
  >
    <!-- 选中时反色填充，hover 时保持反色 -->
    <ToggleGroupItem
      v-for="tag in options"
      :key="tag"
      :value="tag"
      class="rounded-full px-3 text-muted-foreground data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/85 data-[state=on]:hover:text-background"
    >
      {{ tag }}
    </ToggleGroupItem>
  </ToggleGroup>
</template>
