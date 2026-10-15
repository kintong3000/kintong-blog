// src/typed-router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: {
      title: string
      date: string
      draft?: boolean
      type?: string
      redirect?: string
      lang?: string
      duration?: string
      recording?: string
      upcoming?: boolean
      place?: string
      tags?: string[]
    }
  }
}
