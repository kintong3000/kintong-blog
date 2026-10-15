<script setup lang="ts">
import { ChevronRight, File, Folder, FolderOpen } from "@lucide/vue"
import { ref, computed } from 'vue'
import type { GitHubFile } from '@/composables/useGitHub'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar'

interface Props {
  files: GitHubFile[]
  currentPath?: string
  onFileSelect?: (file: GitHubFile) => void
  onFolderSelect?: (path: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: '',
})

const emit = defineEmits<{
  fileSelect: [file: GitHubFile]
  folderSelect: [path: string]
}>()

const openFolders = ref<Set<string>>(new Set())

const toggleFolder = (path: string) => {
  if (openFolders.value.has(path)) {
    openFolders.value.delete(path)
  } else {
    openFolders.value.add(path)
  }
}

const isFolderOpen = (path: string) => openFolders.value.has(path)

const handleFileClick = (file: GitHubFile) => {
  if (file.type === 'dir') {
    toggleFolder(file.path)
    emit('folderSelect', file.path)
  } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
    emit('fileSelect', file)
  }
}

const sortedFiles = computed(() => {
  return [...props.files].sort((a, b) => {
    // Folders first, then files
    if (a.type !== b.type) {
      return a.type === 'dir' ? -1 : 1
    }
    // Alphabetical order
    return a.name.localeCompare(b.name)
  })
})
</script>

<template>
  <div class="git-file-tree">
    <SidebarMenu class="gap-1">
      <SidebarMenuItem v-for="file in sortedFiles" :key="file.path">
        <Collapsible 
          v-if="file.type === 'dir'"
          class="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
          :open="isFolderOpen(file.path)"
          @update:open="(open) => open ? openFolders.add(file.path) : openFolders.delete(file.path)"
        >
          <CollapsibleTrigger as-child>
            <SidebarMenuButton @click="handleFileClick(file)">
              <ChevronRight class="transition-transform size-3" />
              <FolderOpen v-if="isFolderOpen(file.path)" class="size-4" />
              <Folder v-else class="size-4" />
              <span class="truncate">{{ file.name }}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <GitHubFileTree 
                :files="[]" 
                :current-path="file.path"
                @file-select="$emit('fileSelect', $event)"
                @folder-select="$emit('folderSelect', $event)"
              />
              <div class="text-xs text-muted-foreground px-4 py-2">
                Loading...
              </div>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>

        <SidebarMenuButton
          v-else
          :is-active="currentPath === file.path"
          class="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
          @click="handleFileClick(file)"
        >
          <File class="size-4" />
          <span class="truncate">{{ file.name }}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </div>
</template>

<style scoped>
.git-file-tree {
  font-size: 0.875rem;
}
</style>