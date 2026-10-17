import 'vue-router'
import type { Frontmatter } from './index'

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: Frontmatter
  }
}
