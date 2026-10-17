<script setup lang="ts">
import type {Post} from "@/types";
import {formatDate} from "@/utils/formatDate";
import {ref, computed} from 'vue';

const props = defineProps<{
  type?: string
  posts?: Post[]
  extra?: Post[]
}>()

const checkedItems = ref([])

const router = useRouter()
const routes: any[] = router.getRoutes()
    .filter(i => i.path.startsWith('/blogs') && i.meta.frontmatter.date && !i.meta.frontmatter.draft)
    .filter(i => !i.path.endsWith('.html') && (!props.type || (i.meta.frontmatter.type || 'blog').split('+').includes(props.type)))
    .map(i => ({
      path: i.meta.frontmatter.redirect || i.path,
      title: i.meta.frontmatter.title,
      date: i.meta.frontmatter.date,
      lang: i.meta.frontmatter.lang,
      duration: i.meta.frontmatter.duration,
      recording: i.meta.frontmatter.recording,
      upcoming: i.meta.frontmatter.upcoming,
      redirect: i.meta.frontmatter.redirect,
      place: i.meta.frontmatter.place,
      tags: i.meta.frontmatter.tags,
    }))

const allPosts = computed(() =>
    [...(props.posts || routes), ...props.extra || []]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
)

const tags = computed(() => {
  const allTags = allPosts.value.flatMap(p => p.tags || []);
  return [...new Set(allTags)];
});

const selectedTags = ref<string[]>([]);

const posts = computed(() => {
  if (selectedTags.value.length === 0) return allPosts.value
  return allPosts.value.filter(p =>
      selectedTags.value.every(tag => p.tags?.includes(tag))
  )
})
const getYear = (a: Date | string | number) => new Date(a).getFullYear()
const isSameYear = (a?: Date | string | number, b?: Date | string | number) => a && b && getYear(a) === getYear(b)

function isSameGroup(a: Post, b?: Post) {
  return isSameYear(a.date, b?.date)
}

function getGroupName(p: Post) {
  return getYear(p.date)
}
</script>

<template>
  <div class="m-auto max-w-prose">
    <div class="text-6xl font-sans font-bold text-center mb-10 slide-enter list-title">Blog</div>

    <div class="text-center mb-8 flex justify-center flex-wrap">
      <tag-button v-model="selectedTags"
                  :options="tags"/>
    </div>

    <ul>
      <div v-for="(article, index) in posts" :key="index">
        <div
            v-if="!isSameGroup(article, posts[index - 1])"
            class="select-none relative h-20 pointer-events-none"
            slide-enter
            :style="{
          '--enter-stage': index + 3,
          '--enter-step': '60ms',
        }"
        >
          <span class="text-[8em] text-transparent absolute -left-12 -top-8 font-bold [-webkit-text-stroke-width:2px] [-webkit-text-stroke-color:#aaa]
                opacity-10">{{ getGroupName(article) }}</span>
        </div>
        <div class="slide-enter" :style="{
          '--enter-stage': index+1,
          '--enter-step': '60ms',
        }">
          <RouterLink :to="article.path" class="item block font-normal mb-6 mt-2 no-underline">
            <li class="no-underline flex flex-col md:flex-row gap-2 md:items-center">
              <div class="title text-lg leading-[1.2em] flex gap-2 flex-wrap">
                <span class="align-middle">{{ article.title }}</span>
              </div>
              <div class="flex gap-2 items-center">
                <span class="text-sm opacity-50 whitespace-nowrap">
                  {{ formatDate(article.date, true) }}
                </span>
                <div v-if="article.tags" class="flex gap-2">
                  <Badge v-for="tag in article.tags" :key="tag" as="span" variant="secondary">{{ tag }}</Badge>
                </div>
              </div>
            </li>
          </RouterLink>
        </div>
      </div>
    </ul>
  </div>
</template>
