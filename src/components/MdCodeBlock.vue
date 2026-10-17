<script setup lang="ts">
// markdown 代码块渲染成的组件，由 plugins/markdownCodeBlock.ts 在构建时生成
const props = defineProps<{
  lang: string
  code: string
  title?: string
  lineNumbers?: boolean
}>()

// 没写语言的代码块 lang 为 text，不显示标题栏
const label = computed(() => props.title || (props.lang === 'text' ? '' : props.lang))
</script>

<template>
  <CodeBlock class="my-4">
    <CodeBlockHeader v-if="label">
      <CodeBlockTitle>{{ label }}</CodeBlockTitle>
      <CodeBlockActions>
        <CodeBlockCopyButton :value="code" />
      </CodeBlockActions>
    </CodeBlockHeader>
    <CodeBlockActions v-else>
      <CodeBlockCopyButton :value="code" />
    </CodeBlockActions>
    <CodeBlockContent :line-numbers="lineNumbers">
      <slot />
    </CodeBlockContent>
  </CodeBlock>
</template>
