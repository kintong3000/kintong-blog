<script setup lang="ts">

import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
import 'markdown-it-github-alerts/styles/github-base.css'
import {formatDate} from "@/utils/formatDate";
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

// 目录：滚动时显示，停止滚动后淡出，并高亮当前阅读的章节
onMounted(() => {
  const toc = document.querySelector<HTMLElement>('.table-of-contents')
  const list = toc?.querySelector<HTMLElement>(':scope > ul')
  if (!toc || !list)
    return

  // markdown-it-anchor 生成的 id 本身就是编码后的字符串，与 href 去掉 # 后一致
  const items = Array.from(toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
    .map(link => ({ link, heading: document.getElementById(link.getAttribute('href')!.slice(1)) }))
    .filter((item): item is { link: HTMLAnchorElement, heading: HTMLElement } => !!item.heading)

  // 与 html 的 scroll-padding-top 对应，标题滚到顶部附近即视为进入该章节
  const offset = 100
  let active: HTMLAnchorElement | undefined

  const highlight = () => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    let current: HTMLAnchorElement | undefined
    if (atBottom) {
      current = items.at(-1)?.link
    }
    else {
      for (const { link, heading } of items) {
        if (heading.getBoundingClientRect().top > offset)
          break
        current = link
      }
    }
    if (current === active)
      return

    active?.classList.remove('active')
    current?.classList.add('active')
    active = current

    // 目录过长时，让高亮项保持在目录可视区域内
    if (current) {
      const listRect = list.getBoundingClientRect()
      const linkRect = current.getBoundingClientRect()
      if (linkRect.top < listRect.top || linkRect.bottom > listRect.bottom)
        list.scrollTop += linkRect.top - listRect.top - listRect.height / 2
    }
  }

  const { start: hideLater } = useTimeoutFn(() => toc.classList.remove('toc-visible'), 1500, { immediate: false })

  useEventListener(window, 'scroll', useThrottleFn(() => {
    toc.classList.add('toc-visible')
    hideLater()
    highlight()
  }, 100, true), { passive: true })

  highlight()
})



</script>

<template>

  <div class="prose prose-coolgray dark:prose-invert m-auto px-5 box-content">
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
          class="flex gap-2 -mt-4 slide-enter-70"
      >
        <Badge v-for="tag in frontmatter.tags" :key="tag" as="span" variant="secondary">{{ tag }}</Badge>
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
