import { ref, onMounted } from 'vue'
// @ts-ignore
import MarkdownIt from 'markdown-it'
import Shiki from '@shikijs/markdown-it'
import DOMPurify from 'dompurify'

// This pattern ensures state is created only once and shared across all components.
// The state is defined outside the composable function.

// --- STATE (SINGLETON) ---
const navTree = ref<any[]>([])
const isLoading = ref<boolean>(false)
const contentLoading = ref<boolean>(false)
const error = ref<string | null>(null)
const selectedFile = ref<any | null>(null)
const previewType = ref<string>('')
const previewContent = ref<string>('')
const isFetched = ref<boolean>(false) // Prevents re-fetching on component re-mount
const currentPdfUrl = ref<string>('') // Track current PDF blob URL for cleanup

// --- MARKDOWN CONFIGURATION ---
let md: MarkdownIt | null = null

async function initMarkdown(): Promise<MarkdownIt> {
  if (md) return md

  md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    quotes: '""\'\'',
  })

  try {
    // Configure Shiki for syntax highlighting
    const shikiPlugin = await Shiki({
      themes: {
        light: 'rose-pine-dawn',
        dark: 'vitesse-dark',
      }
    })
    md.use(shikiPlugin)
  } catch (error) {
    console.warn('Failed to add Shiki plugin:', error)
  }

  try {
    // Try to add GitHub alerts support
    const GitHubAlerts = await import('markdown-it-github-alerts')
    const plugin = GitHubAlerts.default || GitHubAlerts
    if (typeof plugin === 'function') {
      md.use(plugin)
    }
  } catch (error) {
    console.warn('Failed to add GitHubAlerts plugin:', error)
  }

  return md
}

// --- IMAGE CACHING AND LAZY LOADING ---
const imageCache = new Map<string, string>() // Cache for loaded images
const imageLoadingStates = new Map<string, boolean>() // Track loading states

// --- IMAGE PATH PROCESSING ---
// Helper function to generate the correct URL based on file type
function getGitHubUrl(filePath: string): string {
  const fileExtension = filePath.toLowerCase().split('.').pop()

  // Use LFS URL for binary files (images, PDFs, etc.)
  if (fileExtension && ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'pdf'].includes(fileExtension)) {
    return `https://media.githubusercontent.com/media/${repoConfig.owner}/${repoConfig.repo}/${repoConfig.branch}/${filePath}`
  } else {
    // Use regular raw URL for text files
    return `https://raw.githubusercontent.com/${repoConfig.owner}/${repoConfig.repo}/${repoConfig.branch}/${filePath}`
  }
}

function processImagePaths(markdownText: string, filePath: string): string {
  // Get the directory path of the current markdown file
  const fileDir = filePath.substring(0, filePath.lastIndexOf('/'))

  // Process markdown image syntax: ![alt](path) with lazy loading
  markdownText = markdownText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // Skip if already absolute URL
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return match // Keep original for absolute URLs
    }

    // Handle relative paths
    let fullPath
    if (src.startsWith('./')) {
      // Relative to current directory: ./image.png
      fullPath = `${fileDir}/${src.substring(2)}`
    } else if (src.startsWith('../')) {
      // Relative to parent directory: ../image.png
      const pathParts = fileDir.split('/')
      let srcParts = src.split('/')
      let upLevels = 0

      // Count how many levels up we need to go
      while (srcParts[0] === '..') {
        upLevels++
        srcParts.shift()
      }

      // Remove directories from the path
      const targetDir = pathParts.slice(0, pathParts.length - upLevels).join('/')
      fullPath = `${targetDir}/${srcParts.join('/')}`
    } else if (src.startsWith('/')) {
      // Absolute path from repo root: /images/image.png
      fullPath = src.substring(1) // Remove leading slash
    } else {
      // Relative to current directory (no prefix): image.png
      fullPath = `${fileDir}/${src}`
    }

    // Generate the correct URL based on file type
    const absolutePath = getGitHubUrl(fullPath)

    // Return markdown that will be converted to proper HTML
    return `![${alt}](${absolutePath})`
  })

  // Process HTML img tags: <img src="path">
  markdownText = markdownText.replace(/<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/g, (match, before, src, after) => {
    // Skip if already absolute URL
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return match
    }

    // Handle relative paths (same logic as above)
    let fullPath
    if (src.startsWith('./')) {
      fullPath = `${fileDir}/${src.substring(2)}`
    } else if (src.startsWith('../')) {
      const pathParts = fileDir.split('/')
      let srcParts = src.split('/')
      let upLevels = 0

      while (srcParts[0] === '..') {
        upLevels++
        srcParts.shift()
      }

      const targetDir = pathParts.slice(0, pathParts.length - upLevels).join('/')
      fullPath = `${targetDir}/${srcParts.join('/')}`
    } else if (src.startsWith('/')) {
      fullPath = src.substring(1) // Remove leading slash
    } else {
      fullPath = `${fileDir}/${src}`
    }

    // Generate the correct URL based on file type
    const absolutePath = getGitHubUrl(fullPath)

    return `<img${before} src="${absolutePath}"${after}>`
  })

  return markdownText
}

// --- POST-PROCESSING FOR LAZY LOADING ---
function addLazyLoadingToHTML(html: string): string {
  // Add lazy loading attributes to all img tags
  return html.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/g, (match, before, src, after) => {
    // Skip if already has data-src (already processed)
    if (before.includes('data-src') || after.includes('data-src')) {
      return match
    }

    // Create placeholder image
    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'

    // Add lazy loading attributes
    const lazyAttributes = `data-src="${src}" class="lazy-image" loading="lazy"`

    return `<img${before} src="${placeholder}" ${lazyAttributes}${after}>`
  })
}

// --- LAZY LOADING FUNCTIONS ---
async function loadImageWithCache(src: string): Promise<string> {
  // Check if image is already cached
  if (imageCache.has(src)) {
    return imageCache.get(src)!
  }

  // Check if image is currently loading
  if (imageLoadingStates.get(src)) {
    // Wait for the current loading to complete
    return new Promise((resolve) => {
      const checkLoading = () => {
        if (!imageLoadingStates.get(src)) {
          resolve(imageCache.get(src) || src)
        } else {
          setTimeout(checkLoading, 100)
        }
      }
      checkLoading()
    })
  }

  // Start loading the image
  imageLoadingStates.set(src, true)

  try {
    // Create a promise that resolves when image loads
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Cache the successful URL
        imageCache.set(src, src)
        resolve(src)
      }
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })

    return imageUrl
  } catch (error) {
    console.warn('Image loading failed:', error)
    return src // Return original URL as fallback
  } finally {
    imageLoadingStates.set(src, false)
  }
}

function setupLazyLoading(): IntersectionObserver {
  // Use Intersection Observer for lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const dataSrc = img.getAttribute('data-src')

        if (dataSrc && !img.classList.contains('loaded')) {
          try {
            // Load image with cache
            const cachedSrc = await loadImageWithCache(dataSrc)

            // Create a new image to preload
            const newImg = new Image()
            newImg.onload = () => {
              // Replace placeholder with actual image
              img.src = cachedSrc
              img.classList.add('loaded')
              img.classList.remove('loading')

              // Stop observing this image
              imageObserver.unobserve(img)
            }
            newImg.onerror = () => {
              img.classList.add('error')
              img.classList.remove('loading')
              imageObserver.unobserve(img)
            }

            img.classList.add('loading')
            newImg.src = cachedSrc
          } catch (error) {
            console.warn('Lazy loading failed:', error)
            img.classList.add('error')
            img.classList.remove('loading')
            imageObserver.unobserve(img)
          }
        }
      }
    })
  }, {
    rootMargin: '50px' // Start loading 50px before image enters viewport
  })

  return imageObserver
}

// --- CONFIGURATION ---
const repoConfig = {
  owner: 'kintong3000',
  repo: 'Library',
  branch: 'main',
}
// --- LOGIC ---
async function fetchAndBuildTree(): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  error.value = null

  const url = `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/git/trees/${repoConfig.branch}?recursive=1`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    const { tree: flatTree } = await response.json()

    const allowedExtensions = ['.md', '.pdf']
    const relevantFiles = flatTree.filter((item: any) =>
      item.type === 'blob' && allowedExtensions.some(ext => item.path.toLowerCase().endsWith(ext))
    )

    if (relevantFiles.length === 0) {
      error.value = `No .md or .pdf files found in repo. Scanned ${flatTree.length} total items.`
      return
    }

    const tree: any[] = []
    for (const file of relevantFiles) {
      // Using filter(Boolean) makes path splitting more robust
      const pathParts = file.path.split('/').filter(Boolean)
      if (pathParts.length === 0) continue

      let currentLevel: any[] = tree

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        let dirNode = currentLevel.find(node => node.title === part && node.items)
        if (!dirNode) {
          dirNode = { title: part, items: [] }
          currentLevel.push(dirNode)
        }
        currentLevel = dirNode.items
      }

      const fileName = pathParts[pathParts.length - 1]

      // Determine the correct URL based on file type
      let downloadUrl: string
      const fileExtension = fileName.toLowerCase().split('.').pop()

      // Use LFS URL for binary files (images, PDFs, etc.)
      if (fileExtension && ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'pdf'].includes(fileExtension)) {
        downloadUrl = `https://media.githubusercontent.com/media/${repoConfig.owner}/${repoConfig.repo}/${repoConfig.branch}/${file.path}`
      } else {
        // Use regular raw URL for text files (markdown, etc.)
        downloadUrl = `https://raw.githubusercontent.com/${repoConfig.owner}/${repoConfig.repo}/${repoConfig.branch}/${file.path}`
      }

      currentLevel.push({
        title: fileName,
        path: file.path,
        download_url: downloadUrl,
      })
    }

    if (tree.length === 0 && relevantFiles.length > 0) {
        error.value = `Error: Failed to build tree from ${relevantFiles.length} relevant files.`
    }

    function sortTree(nodes: any[]): void {
      if (!nodes) return;
      nodes.sort((a: any, b: any) => {
        if (a.items && !b.items) return -1
        if (!a.items && b.items) return 1
        return a.title.localeCompare(b.title)
      });
      nodes.forEach((node: any) => {
        if (node.items) sortTree(node.items)
      });
    }

    sortTree(tree)
    navTree.value = tree
    isFetched.value = true

    // Auto-select README.md if it exists
    autoSelectReadme(tree)

  } catch (e: any) {
    console.error('Error in fetchAndBuildTree:', e)
    error.value = `Failed to fetch repository data: ${e.message || e}`
  } finally {
    isLoading.value = false
  }
}

// Function to automatically select README.md
function autoSelectReadme(tree: any[]): void {
  // Look for README.md in the root level first
  const readmeFile = findReadmeFile(tree)

  if (readmeFile) {
    // Automatically click on README.md
    handleItemClick(readmeFile)
  }
}

// Recursively search for README.md file
function findReadmeFile(nodes: any[]): any | null {
  for (const node of nodes) {
    // Check if this is a README.md file (case insensitive)
    if (!node.items && node.title.toLowerCase() === 'readme.md') {
      return node
    }

    // If it's a folder, search recursively
    if (node.items) {
      const found = findReadmeFile(node.items)
      if (found) return found
    }
  }

  return null
}

async function handleItemClick(item: any): Promise<void> {
  if (item.items) return

  // Don't reload if the same file is already selected
  if (selectedFile.value && selectedFile.value.path === item.path) {
    return
  }

  // Clean up previous PDF blob URL if exists
  if (currentPdfUrl.value) {
    URL.revokeObjectURL(currentPdfUrl.value)
    currentPdfUrl.value = ''
  }

  selectedFile.value = item
  const fileExtension = item.title.split('.').pop()?.toLowerCase()

  try {
    contentLoading.value = true

    if (fileExtension === 'md') {
      previewType.value = 'md'
      const res = await fetch(item.download_url)
      if (!res.ok) {
        throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`)
      }
      let markdownText = await res.text()

      // Process relative image paths to absolute GitHub URLs
      markdownText = processImagePaths(markdownText, item.path)

      // Initialize markdown processor if not already done
      const markdownProcessor = await initMarkdown()
      let rawHtml = markdownProcessor.render(markdownText)

      // Add lazy loading to images
      rawHtml = addLazyLoadingToHTML(rawHtml)

      previewContent.value = DOMPurify.sanitize(rawHtml)
    } else if (fileExtension === 'pdf') {
      previewType.value = 'pdf'

      // Try different approaches for PDF viewing
      try {
        // Method 1: Try to use blob URL
        const response = await fetch(item.download_url)

        // Check if the response is actually a PDF
        const contentType = response.headers.get('content-type')
        console.log('PDF Content-Type:', contentType)

        const arrayBuffer = await response.arrayBuffer()
        console.log('PDF size:', arrayBuffer.byteLength, 'bytes')

        // Create blob with correct MIME type
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
        const pdfUrl = URL.createObjectURL(blob)
        currentPdfUrl.value = pdfUrl
        previewContent.value = pdfUrl

        console.log('PDF blob URL created:', pdfUrl)
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError)
        // Fallback: use direct URL (might trigger download)
        previewContent.value = item.download_url
      }
    } else {
      previewType.value = 'unsupported'
      previewContent.value = ''
    }
  } catch (e: any) {
    console.error('Error in handleItemClick:', e)
    error.value = `Failed to load content: ${e.message || e}`
  } finally {
    contentLoading.value = false
  }
}

// Clean up function to revoke blob URLs
function cleanup(): void {
  if (currentPdfUrl.value) {
    URL.revokeObjectURL(currentPdfUrl.value)
    currentPdfUrl.value = ''
  }
}

// --- COMPOSABLE ---
export function useDocPreview() {
  onMounted(() => {
    if (!isFetched.value) {
      fetchAndBuildTree()
    }
  })

  return {
    navTree,
    isLoading,
    contentLoading,
    error,
    selectedFile,
    previewType,
    previewContent,
    handleItemClick,
    cleanup,
    setupLazyLoading,
    loadImageWithCache,
  }
}
