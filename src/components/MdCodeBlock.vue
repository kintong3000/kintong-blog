<script setup lang="ts">
// markdown 代码块渲染成的组件，由 plugins/markdownCodeBlock.ts 在构建时生成
import {ChevronDownIcon, ChevronUpIcon, DownloadIcon, WrapTextIcon} from '@lucide/vue'

const props = defineProps<{
  lang: string
  code: string
  title?: string
}>()

// 超过这个行数的代码块默认折叠
const COLLAPSE_LINES = 15

const EXTENSIONS: Record<string, string> = {
  bash: 'sh',
  javascript: 'js',
  markdown: 'md',
  python: 'py',
  shell: 'sh',
  text: 'txt',
  typescript: 'ts',
  yaml: 'yml',
}

const id = useId()
const [wrap, toggleWrap] = useToggle(false)
const [expanded, toggleExpanded] = useToggle(false)
const collapsible = computed(() => props.code.split('\n').length > COLLAPSE_LINES)
// 没写语言的代码块 lang 为 text，不显示标题栏
const label = computed(() => props.title || (props.lang === 'text' ? '' : props.lang))

// title 没写扩展名时按语言补上
const filename = computed(() => {
  const name = props.title || 'code'
  return name.includes('.') ? name : `${name}.${EXTENSIONS[props.lang] ?? props.lang}`
})

function download() {
  const url = URL.createObjectURL(new Blob([props.code], {type: 'text/plain'}))
  const link = document.createElement('a')
  link.href = url
  link.download = filename.value
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <CodeBlock class="my-4">
    <CodeBlockHeader v-if="label" class="border-b border-foreground/10 bg-foreground/4 pb-3 dark:bg-foreground/6">
      <CodeBlockTitle>{{ label }}</CodeBlockTitle>
    </CodeBlockHeader>
    <CodeBlockActions>
      <Button
        variant="ghost"
        size="icon-xs"
        class="aria-pressed:bg-accent"
        :aria-label="wrap ? 'Disable wrap' : 'Enable wrap'"
        :aria-pressed="wrap"
        @click="toggleWrap()"
      >
        <WrapTextIcon />
      </Button>
      <Button variant="ghost" size="icon-xs" aria-label="Download" @click="download">
        <DownloadIcon />
      </Button>
      <CodeBlockCopyButton :value="code" />
    </CodeBlockActions>
    <CodeBlockContent
      :id="id"
      line-numbers
      :wrap="wrap"
      :class="[
        // 标题栏下有分隔线，内容顶部恢复完整间距
        'group-has-data-[slot=code-block-header]/code-block:pt-4',
        collapsible && !expanded && 'max-h-80 overflow-y-hidden mask-b-from-60%',
      ]"
    >
      <slot />
    </CodeBlockContent>
    <CodeBlockFooter v-if="collapsible" class="justify-center">
      <Button
        variant="ghost"
        size="sm"
        :aria-expanded="expanded"
        :aria-controls="id"
        @click="toggleExpanded()"
      >
        {{ expanded ? 'Show less' : 'Show more' }}
        <ChevronUpIcon v-if="expanded" />
        <ChevronDownIcon v-else />
      </Button>
    </CodeBlockFooter>
  </CodeBlock>
</template>
