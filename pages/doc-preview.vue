<template>
  <div class="doc-preview-layout">
    <!-- File Browser Column -->
    <div class="file-browser">
      <div class="path-header">
        <span class="font-mono">{{ repoConfig.owner }}/{{ repoConfig.repo }}</span>
      </div>
      <div v-if="currentPath" class="path-navigation">
        <button @click="navigate('..')">..</button>
        <span>/{{ currentPath }}</span>
      </div>
      <div v-if="isLoading" class="loading-state">
        Loading files...
      </div>
      <ul v-else-if="error" class="error-state">
        {{ error }}
      </ul>
      <ul v-else class="file-list">
        <li
          v-for="item in files"
          :key="item.path"
          class="file-item"
          :class="{ 'is-dir': item.type === 'dir' }"
          @click="handleItemClick(item)"
        >
          <!-- Icon -->
          <span class="icon">{{ item.type === 'dir' ? '📁' : '📄' }}</span>
          <span class="name">{{ item.name }}</span>
        </li>
      </ul>
    </div>

    <!-- Content Preview Column -->
    <div class="content-preview">
      <div v-if="!selectedFile" class="placeholder">
        <p>Select a <code>.md</code> or <code>.pdf</code> file to preview.</p>
      </div>
      <div v-else-if="previewType === 'md'" class="markdown-body">
        <article class="prose m-auto" v-html="previewContent"></article>
      </div>
      <div v-else-if="previewType === 'pdf'" class="pdf-body">
        <iframe :src="previewContent" frameborder="0" width="100%" height="100%"></iframe>
      </div>
       <div v-else class="placeholder">
        <p>Cannot preview this file type. Please select a <code>.md</code> or <code>.pdf</code> file.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// --- CONFIGURATION ---
// Please replace with your target repository details
const repoConfig = {
  owner: 'KinTong3000',
  repo: 'kintong3000.me'
}
// ---------------------

const files = ref([])
const currentPath = ref('')
const isLoading = ref(false)
const error = ref(null)

const selectedFile = ref(null)
const previewType = ref('') // 'md', 'pdf', or ''
const previewContent = ref('')

// Fetch directory contents from GitHub API
async function fetchDirectory(path) {
  isLoading.value = true
  error.value = null
  selectedFile.value = null
  previewType.value = ''
  previewContent.value = ''
  
  const url = `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/contents/${path}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch directory: ${response.statusText}`)
    }
    const data = await response.json()
    
    // Sort directories first, then files, alphabetically
    files.value = data.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === 'dir' ? -1 : 1
    })
  } catch (e) {
    console.error(e)
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

// Handle item click (file or directory)
async function handleItemClick(item) {
  if (item.type === 'dir') {
    currentPath.value = item.path
    await fetchDirectory(item.path)
  } else if (item.type === 'file') {
    selectedFile.value = item
    
    const fileExtension = item.name.split('.').pop().toLowerCase()
    
    if (fileExtension === 'md') {
      previewType.value = 'md'
      try {
        isLoading.value = true
        const res = await fetch(item.download_url)
        const markdownText = await res.text()
        const rawHtml = await marked(markdownText)
        previewContent.value = DOMPurify.sanitize(rawHtml)
      } catch (e) {
        error.value = 'Failed to load Markdown content.'
      } finally {
        isLoading.value = false
      }
    } else if (fileExtension === 'pdf') {
      previewType.value = 'pdf'
      previewContent.value = item.download_url
    } else {
      previewType.value = 'unsupported'
      previewContent.value = ''
    }
  }
}

// Navigate up or to a specific path
function navigate(direction) {
  if (direction === '..') {
    const pathParts = currentPath.value.split('/').filter(Boolean)
    pathParts.pop()
    const newPath = pathParts.join('/')
    currentPath.value = newPath
    fetchDirectory(newPath)
  }
}

// Initial load
onMounted(() => {
  fetchDirectory('')
})
</script>

<style scoped>
.doc-preview-layout {
  display: flex;
  height: calc(100vh - 64px); /* Adjust 64px based on your header height */
  border-top: 1px solid var(--vp-c-divider);
}

.file-browser {
  width: 300px;
  border-right: 1px solid var(--vp-c-divider);
  overflow-y: auto;
  padding: 1rem;
  flex-shrink: 0;
}

.path-header {
  font-weight: 600;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 0.75rem;
}

.path-navigation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.path-navigation button {
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  cursor: pointer;
}
.path-navigation button:hover {
  background-color: var(--vp-c-bg-mute);
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.4rem;
  cursor: pointer;
  border-radius: 4px;
  user-select: none;
}

.file-item:hover {
  background-color: var(--vp-c-bg-soft);
}

.file-item .icon {
  margin-right: 0.5rem;
}

.file-item.is-dir .name {
  font-weight: 500;
}

.content-preview {
  flex-grow: 1;
  overflow-y: auto;
}

.markdown-body {
  padding: 2rem;
}

.pdf-body {
  width: 100%;
  height: 100%;
}

.placeholder, .loading-state, .error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--vp-c-text-2);
}

.error-state {
  color: var(--vp-c-red-1);
}
</style>
