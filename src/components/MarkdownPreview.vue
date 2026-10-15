<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface Props {
  content?: string
  rawUrl?: string
}

const props = defineProps<Props>()

const content = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

const renderMarkdown = async (markdownContent: string) => {
  try {
    isLoading.value = true
    error.value = null

    // Use marked to convert markdown to HTML
    const html = await marked.parse(markdownContent)

    // Sanitize the HTML to prevent XSS attacks
    content.value = DOMPurify.sanitize(html)
  } catch (err) {
    error.value = 'Failed to render markdown'
    console.error('Markdown rendering error:', err)
  } finally {
    isLoading.value = false
  }
}

const fetchContent = async () => {
  if (props.rawUrl) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetch(props.rawUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const markdownContent = await response.text()
      await renderMarkdown(markdownContent)
    } catch (err) {
      error.value = `Failed to fetch content: ${err instanceof Error ? err.message : 'Unknown error'}`
    } finally {
      isLoading.value = false
    }
  } else if (props.content) {
    await renderMarkdown(props.content)
  }
}

watch(() => props.content, fetchContent)
watch(() => props.rawUrl, fetchContent)

onMounted(() => {
  if (props.content || props.rawUrl) {
    fetchContent()
  }
})
</script>

<template>
  <div class="markdown-preview h-full overflow-auto">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <div class="text-muted-foreground">Loading markdown...</div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-full">
      <div class="text-destructive">{{ error }}</div>
    </div>

    <div
      v-else-if="content"
      class="prose prose-coolgray dark:prose-invert max-w-none p-6"
      v-html="content"
    />

    <div v-else class="flex items-center justify-center h-full">
      <div class="text-muted-foreground">Select a markdown file to preview</div>
    </div>
  </div>
</template>

<style scoped>
.markdown-preview {
  font-family: inherit;
}

.markdown-preview :deep(pre) {
  background: var(--muted) !important;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-preview :deep(code) {
  background: var(--muted) !important;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.markdown-preview :deep(pre code) {
  background: transparent !important;
  padding: 0;
}

.markdown-preview :deep(h1) {
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.markdown-preview :deep(h2) {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid var(--border);
  padding: 0.5rem;
  text-align: left;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid var(--border);
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}
</style>
