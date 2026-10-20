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
// 引入 vite-ssg 的类型，为 Vite 配置补充 ssgOptions 字段
import type {} from 'vite-ssg'


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
    // 页面来自虚拟路由模块、组件由插件自动导入，Vite 启动扫描发现不了这些依赖，
    // 首次跳转时才预构建会触发整页刷新导致跳转失败，这里提前声明
    optimizeDeps: {
        include: [
            '@lucide/vue',
            '@unhead/vue',
            'class-variance-authority',
            'cn',
            'motion-v',
            'reka-ui',
            'shiki/core',
            'shiki/engine/javascript',
            // 与 src/components/ui/code-block/highlighter.ts 中的语言和主题保持一致
            'shiki/langs/css.mjs',
            'shiki/langs/diff.mjs',
            'shiki/langs/html.mjs',
            'shiki/langs/javascript.mjs',
            'shiki/langs/json.mjs',
            'shiki/langs/jsx.mjs',
            'shiki/langs/markdown.mjs',
            'shiki/langs/python.mjs',
            'shiki/langs/shellscript.mjs',
            'shiki/langs/sql.mjs',
            'shiki/langs/tsx.mjs',
            'shiki/langs/typescript.mjs',
            'shiki/langs/vue.mjs',
            'shiki/langs/yaml.mjs',
            'shiki/themes/github-dark.mjs',
            'shiki/themes/github-light.mjs',
        ],
    },
    ssgOptions: {
        // 输出 blogs/index.html 而不是 blogs.html，任何静态托管都能直接按路径访问
        dirStyle: 'nested',
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '~': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
