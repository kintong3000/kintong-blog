<script setup lang="ts">
import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
import 'markdown-it-github-alerts/styles/github-base.css'
import AppSidebar from "@/components/AppSidebar.vue"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useDocPreview } from '@/composables/useDocPreview'

const {
  selectedFile,
  previewType,
  previewContent,
  contentLoading,
  cleanup,
  setupLazyLoading,
  loadImageWithCache,
} = useDocPreview()

// PDF error handling
const pdfError = ref(false)
const useGoogleViewer = ref(false)

function handlePdfLoad() {
  console.log('PDF loaded successfully')
}

function handlePdfError() {
  console.log('PDF load failed, trying Google Viewer')
  pdfError.value = true
}

function handleGoogleViewerLoad() {
  console.log('Google Viewer loaded successfully')
}

function handleGoogleViewerError() {
  console.log('Google Viewer failed, showing download option')
  useGoogleViewer.value = true
}

// Reset PDF error when file changes
watch(selectedFile, () => {
  pdfError.value = false
  useGoogleViewer.value = false
})

// Image viewer functionality
const imageViewer = ref({
  isOpen: false,
  src: '',
  alt: '',
  scale: 1,
  isDragging: false,
  position: { x: 0, y: 0 },
  naturalWidth: 0,
  naturalHeight: 0,
  initialScale: 1
})

function openImageViewer(src: string, alt: string = '', sourceImg?: HTMLImageElement) {
  // 预览框固定尺寸 (80% 视窗)
  const viewerWidth = window.innerWidth * 0.8
  const viewerHeight = window.innerHeight * 0.8

  imageViewer.value = {
    isOpen: true,
    src: src,
    alt,
    scale: 1,
    isDragging: false,
    position: { x: 0, y: 0 },
    naturalWidth: 0,
    naturalHeight: 0,
    initialScale: 1
  }

  // 如果有源图片元素，直接获取其尺寸信息
  if (sourceImg && sourceImg.complete && sourceImg.naturalWidth > 0) {
    calculateInitialScale(sourceImg.naturalWidth, sourceImg.naturalHeight, viewerWidth, viewerHeight)
  } else {
    // 创建临时图片对象获取尺寸（只在必要时）
    const tempImg = new Image()
    tempImg.onload = () => {
      calculateInitialScale(tempImg.naturalWidth, tempImg.naturalHeight, viewerWidth, viewerHeight)
    }
    tempImg.src = src
  }

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'
}

function calculateInitialScale(naturalWidth: number, naturalHeight: number, viewerWidth: number, viewerHeight: number) {
  imageViewer.value.naturalWidth = naturalWidth
  imageViewer.value.naturalHeight = naturalHeight

  // 计算初始缩放比例，确保图片适合预览框
  const scaleX = viewerWidth / naturalWidth
  const scaleY = viewerHeight / naturalHeight
  let initialScale = Math.min(scaleX, scaleY)

  // 如果图片很小，自动放大到合适大小
  const minDisplaySize = 300 // 最小显示尺寸
  if (naturalWidth < minDisplaySize && naturalHeight < minDisplaySize) {
    const enlargeScale = minDisplaySize / Math.max(naturalWidth, naturalHeight)
    initialScale = Math.min(enlargeScale, 2) // 最大放大2倍
  }

  // 确保不会过度放大
  initialScale = Math.min(initialScale, 3)

  imageViewer.value.initialScale = initialScale
  imageViewer.value.scale = initialScale
}



function closeImageViewer() {
  imageViewer.value.isOpen = false
  document.body.style.overflow = ''
}

// Zoom functionality
function zoomIn() {
  imageViewer.value.scale = Math.min(imageViewer.value.scale * 1.2, 5)
}

function zoomOut() {
  imageViewer.value.scale = Math.max(imageViewer.value.scale / 1.2, 0.1)
}

function resetZoom() {
  imageViewer.value.scale = imageViewer.value.initialScale
  imageViewer.value.position = { x: 0, y: 0 }
}

// Mouse wheel zoom
function handleWheel(event: WheelEvent) {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Drag functionality
let dragStart = { x: 0, y: 0 }

function startDrag(event: MouseEvent) {
  if (imageViewer.value.scale > imageViewer.value.initialScale) {
    imageViewer.value.isDragging = true
    dragStart = {
      x: event.clientX - imageViewer.value.position.x,
      y: event.clientY - imageViewer.value.position.y
    }
  }
}

function onDrag(event: MouseEvent) {
  if (imageViewer.value.isDragging && imageViewer.value.scale > imageViewer.value.initialScale) {
    imageViewer.value.position = {
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    }
  }
}

function endDrag() {
  imageViewer.value.isDragging = false
}

// Handle keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  if (!imageViewer.value.isOpen) return

  switch (event.key) {
    case 'Escape':
      closeImageViewer()
      break
    case '+':
    case '=':
      event.preventDefault()
      zoomIn()
      break
    case '-':
      event.preventDefault()
      zoomOut()
      break
    case '0':
      event.preventDefault()
      resetZoom()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

// Lazy loading observer
let imageObserver: IntersectionObserver | null = null

// Add click listeners and setup lazy loading after content is rendered
function addImageClickListeners() {
  nextTick(() => {
    const images = document.querySelectorAll('.markdown-content img')

    // Setup lazy loading observer
    if (imageObserver) {
      imageObserver.disconnect()
    }
    imageObserver = setupLazyLoading()

    images.forEach((element) => {
      const img = element as HTMLImageElement
      // Setup lazy loading observation
      if (img.classList.contains('lazy-image')) {
        imageObserver!.observe(img)
      }

      // Add click listener
      img.addEventListener('click', (event) => {
        // For loaded images, use the current src; for lazy images, use data-src only if not loaded
        let actualSrc
        if (img.classList.contains('loaded') || !img.hasAttribute('data-src')) {
          // Image is already loaded, use current src
          actualSrc = img.src
        } else {
          // Image not loaded yet, use data-src
          actualSrc = img.getAttribute('data-src') || img.src
        }

        // Skip if it's a placeholder image
        if (actualSrc.startsWith('data:image/svg+xml')) {
          return
        }

        // Quick click animation and immediate open
        img.style.transform = 'scale(0.98)'
        img.style.transition = 'transform 0.1s ease-out'

        // Open viewer immediately with minimal delay, pass source image for size info
        setTimeout(() => {
          img.style.transform = ''
          img.style.transition = ''
          // 传递源图片元素，避免重复请求
          openImageViewer(actualSrc, img.alt, img.complete ? img : undefined)
        }, 50)
      })
    })
  })
}

// Watch for content changes to add image listeners
watch([previewContent, previewType], () => {
  if (previewType.value === 'md' && previewContent.value) {
    addImageClickListeners()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''

  // Clean up image observer
  if (imageObserver) {
    imageObserver.disconnect()
    imageObserver = null
  }

  cleanup()
})

// Clean up blob URLs when component is unmounted
onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="border-t">
  </div>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink href="#">
                Documentation
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden md:block" v-if="selectedFile" />
            <BreadcrumbItem v-if="selectedFile">
              <BreadcrumbPage>{{ selectedFile.title }}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div class="content-preview">
        <div v-if="!selectedFile" class="placeholder">
          <div class="prose prose-coolgray dark:prose-invert m-auto">
            <p>Select a <code>.md</code> or <code>.pdf</code> file to preview.</p>
          </div>
        </div>
        <div v-else-if="contentLoading" class="placeholder">
          <div class="prose prose-coolgray dark:prose-invert m-auto">
            <p>Loading content...</p>
          </div>
        </div>
        <div v-else-if="previewType === 'md'" class="markdown-content">
          <div class="prose prose-coolgray dark:prose-invert m-auto slide-enter-content">
            <article class="text-base" v-html="previewContent"></article>
          </div>
        </div>
        <div v-else-if="previewType === 'pdf'" class="pdf-content">
          <!-- Try multiple methods for PDF viewing -->
          <iframe
            v-if="!pdfError"
            :src="previewContent"
            width="100%"
            height="100%"
            frameborder="0"
            @load="handlePdfLoad"
            @error="handlePdfError"
          ></iframe>

          <!-- Fallback: Google Docs Viewer -->
          <iframe
            v-else-if="!useGoogleViewer"
            :src="`https://docs.google.com/viewer?url=${encodeURIComponent(selectedFile.download_url)}&embedded=true`"
            width="100%"
            height="100%"
            frameborder="0"
            @load="handleGoogleViewerLoad"
            @error="handleGoogleViewerError"
          ></iframe>

          <!-- Final fallback: Download link -->
          <div v-else class="pdf-fallback">
            <div class="prose prose-coolgray dark:prose-invert m-auto text-center">
              <p>PDF preview is not available. Please download the file to view it.</p>
              <a :href="selectedFile.download_url" download class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <span class="icon-[lucide--download] w-4 h-4"></span>
                Download PDF
              </a>
            </div>
          </div>
        </div>
        <div v-else class="placeholder">
          <div class="prose prose-coolgray dark:prose-invert m-auto">
            <p>Cannot preview this file type. Please select a <code>.md</code> or <code>.pdf</code> file.</p>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Image Viewer Modal with Animations -->
  <Teleport to="body">
    <Transition
      name="image-viewer"
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="imageViewer.isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeImageViewer"
        @wheel="handleWheel"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
      >
        <Transition
          name="image-content"
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-98 translate-y-1"
        >
          <div v-if="imageViewer.isOpen" class="relative bg-gray-900/50 rounded-lg" @click.stop
               :style="{ width: '80vw', height: '80vh' }">
            <!-- Close button with animation -->
            <Transition
              name="close-button"
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-90"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <button
                v-if="imageViewer.isOpen"
                @click="closeImageViewer"
                class="absolute -top-2 -right-2 z-10 flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <span class="icon-[lucide--x] w-4 h-4"></span>
              </button>
            </Transition>

            <!-- Fixed size image container -->
            <div class="absolute inset-4 flex items-center justify-center overflow-hidden rounded-lg">
              <img
                :src="imageViewer.src"
                :alt="imageViewer.alt"
                class="block transition-transform duration-200"
                :class="{ 'cursor-grab': imageViewer.scale > imageViewer.initialScale && !imageViewer.isDragging, 'cursor-grabbing': imageViewer.isDragging }"
                :style="{
                  transform: `scale(${imageViewer.scale / imageViewer.initialScale}) translate(${imageViewer.position.x / imageViewer.scale}px, ${imageViewer.position.y / imageViewer.scale}px)`,
                  transformOrigin: 'center center',
                  width: imageViewer.naturalWidth ? `${imageViewer.naturalWidth}px` : 'auto',
                  height: imageViewer.naturalHeight ? `${imageViewer.naturalHeight}px` : 'auto'
                }"
                @click.stop
                @mousedown="startDrag"
              />
            </div>

            <!-- Zoom Controls -->
            <div class="absolute top-4 right-4 flex flex-col gap-2 bg-black/60 rounded-lg p-2" @click.stop>
              <button
                @click.stop="zoomIn"
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Zoom In"
              >
                <span class="icon-[lucide--zoom-in] w-5 h-5 text-white"></span>
              </button>
              <button
                @click.stop="zoomOut"
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <span class="icon-[lucide--zoom-out] w-5 h-5 text-white"></span>
              </button>
              <button
                @click.stop="resetZoom"
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                <span class="icon-[lucide--maximize] w-5 h-5 text-white"></span>
              </button>
              <div class="text-white text-xs text-center mt-1">
                {{ Math.round((imageViewer.scale / imageViewer.initialScale) * 100) }}%
              </div>
            </div>

            <!-- Image caption with animation -->
            <Transition
              name="caption"
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div
                v-if="imageViewer.alt && imageViewer.isOpen"
                class="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 rounded-b-lg backdrop-blur-sm"
              >
                <p class="text-sm text-center">{{ imageViewer.alt }}</p>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@reference "@/styles/globals.css";

/* Import the same markdown styles used in blog pages */
@import '@/styles/prose.css';
@import '@/styles/main.css';
@import '@/styles/markdown.css';

.content-preview {
  height: calc(100vh - 65px); /* Adjust 65px based on your header height */
  overflow-y: auto;
}

.markdown-content {
  padding: 2rem;
  height: 100%;
}

.pdf-content {
  width: 100%;
  height: 100%;
  padding: 0;
  position: relative;
}

.pdf-object {
  border: none;
  outline: none;
}

.pdf-fallback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  padding: 2rem;
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
}

/* Ensure Shiki code blocks are properly styled */
.markdown-content :deep(.shiki) {
  font-family: 'DM Mono', 'Input Mono', 'Fira Code', monospace;
  font-size: 0.92em;
  line-height: 1.4;
  margin: 0.5em 0;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
}

/* Dark theme support for Shiki */
html.dark .markdown-content :deep(.shiki),
html.dark .markdown-content :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: var(--my-code-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

/* Inline code styling */
.markdown-content :deep(code:not(.shiki code)) {
  background: var(--muted) !important;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'DM Mono', 'Input Mono', 'Fira Code', monospace;
}

/* Image styling - preserve original size and add click functionality */
.markdown-content :deep(img) {
  max-width: 100% !important;
  height: auto !important;
  width: auto !important;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.markdown-content :deep(img:hover) {
  transform: scale(1.02);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Lazy loading image states */
.markdown-content :deep(img.lazy-image) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

.markdown-content :deep(img.lazy-image.loading) {
  opacity: 0.7;
  filter: blur(1px);
}

.markdown-content :deep(img.lazy-image.loaded) {
  animation: none;
  background: none;
  opacity: 1;
  filter: none;
  transition: all 0.3s ease-in-out;
}

.markdown-content :deep(img.lazy-image.error) {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  opacity: 0.6;
}

/* Loading shimmer animation */
@keyframes loading-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Image Viewer Animation Styles - Optimized for speed */
.image-viewer-enter-active,
.image-viewer-leave-active {
  transition: all 0.2s ease;
}

.image-viewer-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.image-viewer-enter-to {
  opacity: 1;
  backdrop-filter: blur(4px);
}

.image-viewer-leave-from {
  opacity: 1;
  backdrop-filter: blur(4px);
}

.image-viewer-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Image Content Animation - Faster and smoother */
.image-content-enter-active {
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.image-content-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-content-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.image-content-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.image-content-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.image-content-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(5px);
}

/* Close Button Animation - Simplified */
.close-button-enter-active {
  transition: all 0.2s ease-out;
}

.close-button-leave-active {
  transition: all 0.1s ease-in;
}

.close-button-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.close-button-enter-to {
  opacity: 1;
  transform: scale(1);
}

.close-button-leave-from {
  opacity: 1;
  transform: scale(1);
}

.close-button-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Caption Animation - Faster */
.caption-enter-active {
  transition: all 0.2s ease-out;
}

.caption-leave-active {
  transition: all 0.15s ease-in;
}

.caption-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.caption-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.caption-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.caption-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
