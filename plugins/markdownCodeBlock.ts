import type MarkdownIt from 'markdown-it'
import type {Element, ElementContent} from 'hast'
import type {BundledLanguage, ShikiTransformer} from 'shiki'
import Shiki from '@shikijs/markdown-it'
import {transformerMetaHighlight, transformerNotationDiff, transformerNotationHighlight} from '@shikijs/transformers'

/**
 * 构建时用 Shiki 高亮代码块，并把输出改写成 shadcn-vue 的 CodeBlock 组件：
 *
 * <MdCodeBlock lang code title line-numbers>
 *   <CodeBlockLine variant><span v-pre>...带颜色的 token...</span></CodeBlockLine>
 * </MdCodeBlock>
 *
 * 支持的写法：
 *   ```ts title="main.ts" {1,3} showLineNumbers
 *   // [!code ++]   // [!code --]   // [!code highlight]
 */
export default async function markdownCodeBlock(md: MarkdownIt) {
    const shiki = await Shiki({
        themes: {
            light: 'rose-pine-dawn',
            dark: 'vitesse-dark',
        },
        // 不输出默认颜色，只输出 --shiki-light / --shiki-dark 变量，由 token 上的类名切换
        defaultColor: false,
        // text 是 Shiki 的特殊语言（纯文本），类型里没有列出
        fallbackLanguage: 'text' as BundledLanguage,
        transformers: [
            transformerMetaHighlight(),
            transformerNotationHighlight(),
            transformerNotationDiff(),
            transformerCodeBlock(),
        ],
    })
    // @shikijs/markdown-it 自带的 markdown-it 类型与 @types/markdown-it 不兼容，运行时是同一个对象
    shiki(md as unknown as Parameters<typeof shiki>[0])

    // markdown-it 只在高亮结果以 <pre 开头时才原样使用，否则会再包一层 <pre><code>，
    // 这里直接返回组件标签
    md.renderer.rules.fence = (tokens, idx, options, env) => {
        const info = md.utils.unescapeAll(tokens[idx].info).trim()
        const [lang = '', , ...attrs] = info.split(/(\s+)/g)
        return `${options.highlight!(tokens[idx].content, lang, attrs.join(''))}\n`
    }
}

// 与 CodeBlockToken.vue 相同的上色方式
const TOKEN_CLASS = 'text-(--shiki-light) dark:text-(--shiki-dark)'

function classList(node: Element): string[] {
    const value = node.properties.class
    if (Array.isArray(value))
        return value.map(String)
    return typeof value === 'string' ? value.split(/\s+/) : []
}

// 把 @shikijs/transformers 加在行上的类名转换成 CodeBlockLine 的 variant
function lineVariant(line: Element) {
    const classes = classList(line)
    if (classes.includes('add'))
        return 'added'
    if (classes.includes('remove'))
        return 'removed'
    if (classes.includes('highlighted'))
        return 'highlighted'
}

function textOf(node: ElementContent): string {
    if (node.type === 'text')
        return node.value
    if (node.type === 'element')
        return node.children.map(textOf).join('')
    return ''
}

function transformerCodeBlock(): ShikiTransformer {
    return {
        name: 'code-block',
        span(node) {
            node.properties.class = TOKEN_CLASS
        },
        root(root) {
            const pre = root.children[0] as Element
            const code = pre.children[0] as Element
            const lines = code.children.filter((node): node is Element => node.type === 'element')
            const meta = this.options.meta?.__raw ?? ''
            const title = meta.match(/title=(["'])(.*?)\1/)?.[2]

            root.children = [{
                type: 'element',
                // 必须用 PascalCase：unplugin-vue-markdown 会给所有 <code 开头的标签加 v-pre
                tagName: 'MdCodeBlock',
                properties: {
                    lang: this.options.lang,
                    // 复制用的纯文本，取自处理后的行，[!code ++] 这类标记已被去掉
                    code: lines.map(textOf).join('\n'),
                    ...(title && {title}),
                    ...(/\bshowLineNumbers\b/.test(meta) && {'line-numbers': ''}),
                },
                children: lines.map((line): Element => ({
                    type: 'element',
                    tagName: 'CodeBlockLine',
                    properties: {variant: lineVariant(line)},
                    // v-pre 避免代码里的 {{ }} 被 Vue 当成插值；
                    // 空行不放内容，CodeBlockLine 会补一个换行，复制时保留空行
                    children: line.children.length
                        ? [{type: 'element', tagName: 'span', properties: {'v-pre': ''}, children: line.children}]
                        : [],
                })),
            }]
        },
    }
}
