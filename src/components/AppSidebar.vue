<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import { GalleryVerticalEnd } from "@lucide/vue"
import NavItem from '@/components/NavItem.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useDocPreview } from '@/composables/useDocPreview'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: "floating",
})

const {
  navTree,
  isLoading,
  contentLoading,
  error,
  selectedFile,
  handleItemClick,
} = useDocPreview()

// Helper function to check if an item is selected
const isItemSelected = (item: any) => {
  return selectedFile.value && selectedFile.value.path === item.path
}

// Helper function to get file icon based on file extension
const getFileIcon = (item: any) => {
  if (item.items) return 'icon-[streamline--folder-add-solid]' // Folder icon

  const fileExtension = item.title.split('.').pop().toLowerCase()

  switch (fileExtension) {
    case 'md':
      return 'icon-[streamline--markdown-document-programming-solid]'
    case 'pdf':
      return 'icon-[streamline--convert-pdf-2-solid]'
    default:
      return 'icon-[streamline--markdown-document-programming-solid]' // Default to markdown icon
  }
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="https://github.com/kintong3000/Library">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">Library</span>
<!--                <span class="">v1.0.0</span>-->
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu class="gap-2">
          <div v-if="isLoading" class="px-4 py-2 text-sm">
            Loading repository...
          </div>
          <div v-else-if="error" class="px-4 py-2 text-sm text-red-500">
            {{ error }}
          </div>
          <template v-else>
            <NavItem
              :items="navTree"
              :level="0"
              :handleItemClick="handleItemClick"
              :isItemSelected="isItemSelected"
              :getFileIcon="getFileIcon"
            />
          </template>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
