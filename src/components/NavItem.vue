<script setup lang="ts">
import { ref } from 'vue'
import { GalleryVerticalEnd, Minus, Plus } from "@lucide/vue"
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

interface NavItemProps {
  items: Array<{
    title: string
    path?: string
    items?: Array<any>
    download_url?: string
  }>
  level?: number
  handleItemClick: (item: any) => void
  isItemSelected: (item: any) => boolean
  getFileIcon: (item: any) => string
}

const props = withDefaults(defineProps<NavItemProps>(), {
  level: 0
})


</script>

<template>
  <template v-for="item in items" :key="item.title || item.path">
    <Collapsible v-if="item.items && item.items.length > 0" v-slot="{ open }" class="group/collapsible">
      <SidebarMenuItem v-if="level === 0">
        <CollapsibleTrigger as-child>
          <SidebarMenuButton class="gap-2">
            <span :class="getFileIcon(item)" class="w-4 h-4 flex-shrink-0" />
            <span class="name truncate">{{ item.title }}</span>
            <Plus v-if="!open" class="ml-auto w-4 h-4" />
            <Minus v-if="open" class="ml-auto w-4 h-4" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <NavItem
              :items="item.items"
              :level="level + 1"
              :handleItemClick="handleItemClick"
              :isItemSelected="isItemSelected"
              :getFileIcon="getFileIcon"
            />
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
      <SidebarMenuItem v-else>
        <CollapsibleTrigger as-child>
          <SidebarMenuButton
            class="gap-2"
            :style="{ paddingLeft: (level * 12 + 8) + 'px' }"
          >
            <span :class="getFileIcon(item)" class="w-4 h-4 flex-shrink-0" />
            <span class="name truncate">{{ item.title }}</span>
            <Plus v-if="!open" class="ml-auto w-4 h-4" />
            <Minus v-if="open" class="ml-auto w-4 h-4" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <NavItem
              :items="item.items"
              :level="level + 1"
              :handleItemClick="handleItemClick"
              :isItemSelected="isItemSelected"
              :getFileIcon="getFileIcon"
            />
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
    <SidebarMenuItem v-else-if="level === 0">
      <SidebarMenuButton
        @click="handleItemClick(item)"
        class="gap-2"
        :data-active="isItemSelected(item)"
      >
        <span :class="getFileIcon(item)" class="w-4 h-4 flex-shrink-0" />
        <span class="name truncate">{{ item.title }}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem v-else>
      <SidebarMenuButton
        @click="handleItemClick(item)"
        class="gap-2"
        :data-active="isItemSelected(item)"
        :style="{ paddingLeft: (level * 12 + 8) + 'px' }"
      >
        <span :class="getFileIcon(item)" class="w-4 h-4 flex-shrink-0" />
        <span class="name truncate">{{ item.title }}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </template>
</template>
