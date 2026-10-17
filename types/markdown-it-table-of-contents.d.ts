declare module 'markdown-it-table-of-contents' {
  import type { PluginWithOptions } from 'markdown-it'

  const markdownItTableOfContents: PluginWithOptions<Record<string, unknown>>
  export default markdownItTableOfContents
}
