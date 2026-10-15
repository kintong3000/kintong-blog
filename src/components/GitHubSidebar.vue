<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RefreshCw, CircleAlert } from "@lucide/vue"
import { useGitHub, type GitHubFile } from '@/composables/useGitHub'
import GitHubFileTree from '@/components/GitHubFileTree.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface Props {
  variant?: 'floating' | 'sidebar' | 'inset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'floating'
})

const emit = defineEmits<{
  fileSelect: [file: GitHubFile]
}>()

const { repoOwner, repoName, fetchRepoContents, fetchRepoInfo } = useGitHub()

const repoInfo = ref<any>(null)
const files = ref<GitHubFile[]>([])
const currentPath = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const loadRepoContents = async (path: string = '') => {
  try {
    isLoading.value = true
    error.value = null
    
    const contents = await fetchRepoContents(path)
    files.value = contents
    currentPath.value = path
  } catch (err) {
    error.value = `Failed to load repository contents: ${err instanceof Error ? err.message : 'Unknown error'}`
    console.error('Error loading repo contents:', err)
  } finally {
    isLoading.value = false
  }
}

const loadRepoInfo = async () => {
  try {
    repoInfo.value = await fetchRepoInfo()
  } catch (err) {
    console.error('Error loading repo info:', err)
  }
}

const handleFileSelect = (file: GitHubFile) => {
  emit('fileSelect', file)
}

const handleFolderSelect = async (path: string) => {
  await loadRepoContents(path)
}

const refresh = async () => {
  await loadRepoContents(currentPath.value)
}

onMounted(async () => {
  await Promise.all([
    loadRepoInfo(),
    loadRepoContents()
  ])
})
</script>

<template>
  <Sidebar :variant="variant">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a :href="repoInfo?.html_url" target="_blank" rel="noopener noreferrer">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span class="icon-[mdi--github] size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">{{ repoInfo?.name || repoName }}</span>
                <span class="text-xs opacity-70">{{ repoInfo?.description || 'GitHub Repository' }}</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      
      <div class="flex items-center gap-2 px-4">
        <span class="text-xs text-muted-foreground">
          {{ repoOwner }}/{{ repoName }}
        </span>
        <button 
          @click="refresh"
          :disabled="isLoading"
          class="p-1 rounded hover:bg-sidebar-accent transition-colors"
          title="Refresh"
        >
          <RefreshCw class="size-3" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </SidebarHeader>
    
    <SidebarContent>
      <SidebarGroup>
        <div v-if="error" class="p-3 m-2 rounded bg-destructive/10 text-destructive text-sm">
          <div class="flex items-center gap-2">
            <CircleAlert class="size-4" />
            {{ error }}
          </div>
        </div>
        
        <div v-if="isLoading && files.length === 0" class="p-4 text-center">
          <div class="text-muted-foreground text-sm">Loading repository...</div>
        </div>
        
        <GitHubFileTree
          v-else
          :files="files"
          :current-path="currentPath"
          @file-select="handleFileSelect"
          @folder-select="handleFolderSelect"
        />
        
        <div v-if="files.length === 0 && !isLoading && !error" class="p-4 text-center">
          <div class="text-muted-foreground text-sm">No files found</div>
        </div>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

<style scoped>
.sidebar-header {
  border-bottom: 1px solid var(--sidebar-border);
}
</style>