import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import {VueRouterAutoImports} from 'vue-router/unplugin'
import VueRouter from 'vue-router/vite'
import Components from 'unplugin-vue-components/vite'
import matter from "gray-matter";
import fs from 'node:fs'
import Markdown from 'unplugin-vue-markdown/vite'
import type MarkdownIt from 'markdown-it'
import TOC from "markdown-it-table-of-contents";
import anchor from "markdown-it-anchor";
import GitHubAlerts from 'markdown-it-github-alerts'
import tailwindcss from '@tailwindcss/vite'
import markdownCodeBlock from './plugins/markdownCodeBlock'


export default defineConfig({
    plugins: [
        AutoImport({
            imports: [
                'vue',
                VueRouterAutoImports,
                '@vueuse/core',
            ],
        }),
        tailwindcss(),

        Markdown({
            wrapperComponent: (id, code) => code.includes('introduction')
                ? 'WrapperIntroduction'
                : 'WrapperPost',

            wrapperClasses: (id, code) => code.includes('@layout-full-width')
                ? ''
                : 'prose m-auto slide-enter-content',
            headEnabled: true,
            exportFrontmatter: false,
            exposeFrontmatter: false,
            exposeExcerpt: false,
            markdownOptions: {
                quotes: '""\'\'',
            },
            async markdownSetup(markdownExit) {
                // unplugin-vue-markdown 使用与 markdown-it 兼容的 markdown-exit，
                // 但各插件的类型是按 markdown-it 写的，这里统一转成 markdown-it 类型
                const md = markdownExit as unknown as MarkdownIt
                await markdownCodeBlock(md)

                md.use(TOC, {
                    includeLevel: [1, 2, 3, 4],
                    containerHeaderHtml: '<div class="table-of-contents-anchor" role="img" aria-label="目录"><div class="icon-[material-symbols--toc-rounded] size-[1em]"></div></div>'
                })

                md.use(anchor)
                md.use(GitHubAlerts)

                // 表格外包一层容器，窄屏时横向滚动而不撑破版面
                md.renderer.rules.table_open = () => '<div class="table-wrapper"><table>'
                md.renderer.rules.table_close = () => '</table></div>'
            }
        }),

        VueRouter({
            extensions: ['.vue', '.md'],
            routesFolder: 'pages',
            dts: 'src/route-map.d.ts',
            logs: true,
            extendRoute(route) {
                const path = route.components.get('default')
                if (!path)
                    return

                if (path.endsWith('.md')) {
                    const {data} = matter(fs.readFileSync(path, 'utf-8'))
                    route.addToMeta({
                        frontmatter: data,
                    })
                }
            },
        }),

        Vue({
            include: [/\.vue$/, /\.md$/],
        }),

        Components({
            extensions: ['vue', 'md'],
            dts: true,
            include: [/\.vue$/, /\.vue\?vue/, /\.md$/],

        }),

    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '~': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
