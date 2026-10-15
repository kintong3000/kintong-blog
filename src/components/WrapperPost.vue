<script setup lang="ts">

import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
import 'markdown-it-github-alerts/styles/github-base.css'
import {formatDate} from "../../composables/formatDate";
import type {Frontmatter} from "@/types";

const { frontmatter } = defineProps<{
  frontmatter: Frontmatter
}>()
const router = useRouter()
const content = ref<HTMLDivElement>()
const route = useRoute()


onMounted(() => {
  const navigate = () => {
    if (location.hash) {
      const el = document.querySelector(decodeURIComponent(location.hash))
      if (el) {
        const rect = el.getBoundingClientRect()
        const y = window.scrollY + rect.top - 40
        window.scrollTo({
          top: y,
          behavior: 'smooth',
        })
        return true
      }
    }
  }

  const handleAnchors = (
      event: MouseEvent & { target: HTMLElement },
  ) => {
    const link = event.target.closest('a')

    if (
        !event.defaultPrevented
        && link
        && event.button === 0
        && link.target !== '_blank'
        && link.rel !== 'external'
        && !link.download
        && !event.metaKey
        && !event.ctrlKey
        && !event.shiftKey
        && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(content.value!, 'click', handleAnchors, { passive: false })

  setTimeout(() => {
    if (!navigate())
      setTimeout(navigate, 1000)
  }, 1)
})



</script>

<template>

  <div class="prose prose-coolgray dark:prose-invert m-auto ">
    <div
        v-if="frontmatter.title"
        class="prose m-auto mb-8"
    >
      <h1 class="slide-enter-50">
        {{ frontmatter.title }}
      </h1>
      <p
          v-if="frontmatter.date"
          class="opacity-50 !-mt-6 slide-enter-60"
      >
        {{ formatDate(frontmatter.date, false) }}
      </p>
      <div
          v-if="frontmatter.tags"
          class="tags slide-enter-70"
      >
        <span v-for="tag in frontmatter.tags" :key="tag" class="tag-item">{{ tag }}</span>
      </div>
    </div>
    <article class="text-base ">
      <div class="slide-enter-content" >
        <slot />
      </div>

    </article>
    <div v-if="route.path !== '/' && route.path !== '/blogs'" class="prose m-auto mt-8 slide-enter [animation-delay:500ms] print:hidden">
      <br>
      <span class="font-mono opacity-50">></span>
      <RouterLink
          :to="route.path.split('/').slice(0, -1).join('/') || '/'"
          class="font-mono opacity-50 hover:opacity-75"
          v-text="'cd ..'"
      />
    </div>
  </div>
  <AppFooter/>

</template>

<style scoped>
.tags {
  display: flex;
  gap: 0.5rem;
  margin-top: -1rem;
}
.tag-item {
  padding: 0.1rem 0.4rem;
  font-size: 0.8rem;
  border-radius: 0.25rem;
  background-color: #f0f0f0;
  color: #555;
}
</style>
