# Kintong 的个人博客

[English](./README-EN.md) | 简体中文

基于 Vue 3 + Vite 的静态博客。文章用 Markdown 写，构建时预渲染成纯静态 HTML，部署在 Vercel。

## ✨ 特性

- **Markdown 写作**：`pages/` 下的 `.md` 文件即页面，文件路径即路由
- **静态站点生成**：`vite-ssg` 预渲染所有页面，首屏快、对 SEO 友好
- **代码块**：构建时用 Shiki 高亮，支持标题、行高亮、diff、行号、自动换行、复制、下载和长代码折叠
- **阅读体验**：针对中文优化的排版、跟随滚动高亮当前章节的目录、GitHub 风格提示框
- **亮 / 暗模式**：切换时带圆形扩散过渡动画
- **标签筛选**：博客列表按年份分组，可按标签筛选

## 🛠️ 技术栈

| 用途 | 选型 |
|---|---|
| 框架 | [Vue 3](https://vuejs.org/) + TypeScript |
| 构建 | [Vite](https://vitejs.dev/) + [vite-ssg](https://github.com/antfu-collective/vite-ssg) |
| 路由 | [Vue Router](https://router.vuejs.org/)（基于文件的路由） |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn-vue](https://www.shadcn-vue.com/) |
| Markdown | [unplugin-vue-markdown](https://github.com/unplugin/unplugin-vue-markdown) + [Shiki](https://shiki.style/) |
| 动画 | [motion-v](https://motion.dev/docs/vue) |
| 自动导入 | [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)、[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) |
| 包管理 | [Bun](https://bun.sh/) |

## 🚀 本地开发

环境要求：[Node.js](https://nodejs.org/) >= 20.19、[Bun](https://bun.sh/) >= 1.4

```bash
git clone https://github.com/kintong3000/kintong-blog.git
cd kintong-blog
bun install

bun run dev      # 启动开发服务器 http://localhost:5173
bun run build    # 类型检查并构建到 dist/
bun run preview  # 本地预览构建结果
```

> [!NOTE]
> 项目只使用 Bun，不要用 npm / pnpm / yarn 安装依赖，`.gitignore` 已忽略它们的锁文件。

## ✍️ 写文章

在 `pages/blogs/` 下新建 `.md` 文件，文件名就是文章的 URL，例如 `pages/blogs/hello-world.md` 对应 `/blogs/hello-world`。

### Frontmatter

```yaml
---
title: 文章标题
date: 2024-04-08
tags:
  - 服务器
draft: true        # 可选，草稿不出现在博客列表中
redirect: https://...  # 可选，列表中点击后跳转到这个链接
---
```

只有写了 `date` 的文章才会出现在博客列表中。

### 目录

在正文开头写 `[[toc]]`，会在页面左侧生成目录（大屏可见）。目录收录 h1 至 h4。

### 代码块

````md
```ts title="main.ts" {2}
const a = 1
const b = 2 // 第 2 行高亮
console.log(a) // [!code ++]
console.log(b) // [!code --]
```
````

- `title="..."`：标题栏显示的文件名，也是下载时的文件名；不写时显示语言名
- `{1,3-5}`：高亮指定行
- `// [!code ++]`、`// [!code --]`、`// [!code highlight]`：标记新增、删除、高亮行
- 超过 15 行的代码块会自动折叠

### 提示框

```md
> [!NOTE]
> 补充说明

> [!WARNING]
> 注意事项
```

支持 `NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`。

## 📂 项目结构

```
.
├── pages/                    # 页面，文件路径即路由
│   ├── index.md              # 首页
│   ├── email.vue             # 联系方式
│   └── blogs/
│       ├── index.md          # 博客列表
│       └── *.md              # 文章
├── plugins/
│   └── markdownCodeBlock.ts  # 构建时把代码块渲染成 CodeBlock 组件
├── public/                   # 静态资源，原样复制到 dist/
├── src/
│   ├── components/           # 组件（自动导入）
│   │   ├── icons/            # 图标组件
│   │   └── ui/               # shadcn-vue 组件
│   ├── lib/                  # shadcn-vue 工具函数
│   ├── styles/               # 全局样式、文章排版、目录样式
│   ├── types/                # 类型定义
│   ├── utils/                # 工具函数
│   ├── App.vue
│   └── main.ts
└── vite.config.ts            # Vite、Markdown、路由配置
```

## 🏛️ 构建与部署

`bun run build` 的流程：

1. Vue Router 扫描 `pages/` 生成路由，并读取每篇 Markdown 的 frontmatter 写入路由 `meta`
2. `unplugin-vue-markdown` 把 Markdown 转成 Vue 组件，代码块由 Shiki 在构建时完成高亮
3. `vite-ssg` 逐个渲染所有路由，输出静态 HTML 到 `dist/`

项目关联 Vercel 后，每次推送到 GitHub 都会自动构建并部署 `dist/`。

## 📄 许可

文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。
