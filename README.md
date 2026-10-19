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
| 自动导入 | [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)、[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) |
| 包管理 | [Bun](https://bun.sh/) |

## 🎨 设计与架构

网站的设计和架构参考了 [Anthony Fu 的个人站点 antfu.me](https://antfu.me/)（[源码](https://github.com/antfu/antfu.me)），在此基础上换成了 Tailwind CSS v4 + shadcn-vue 的组件体系。

### 架构

和 antfu.me 一样，整个站点以「Markdown 即页面」为核心：

```
pages/*.md ──► unplugin-vue-markdown ──► Vue 组件 ──┐
                 （Shiki 高亮、目录、锚点、提示框）    │
                                                     ├──► vite-ssg ──► dist/*.html
pages/*.vue ─────────────────────────────────────────┤
                                                     │
vue-router 文件路由 ◄── gray-matter 读取 frontmatter ─┘
       （写入 route.meta，供博客列表使用）
```

- **文件路由**：`vue-router` 扫描 `pages/`，`.md` 与 `.vue` 都是页面；构建时用 `gray-matter` 读取每篇文章的 frontmatter 写入 `route.meta.frontmatter`，博客列表直接从路由表中取文章数据，不需要额外的数据文件
- **布局包裹**：每个 Markdown 页面会被包进一个 Wrapper 组件，含 `<!-- introduction -->` 的页面用 `WrapperIntroduction`（首页），其余用 `WrapperPost`（文章标题、日期、目录高亮、锚点跳转）
- **构建期处理**：代码高亮、代码块组件化（`plugins/markdownCodeBlock.ts`）都在构建时完成，客户端不加载高亮器
- **自动导入**：组件和 Vue / VueUse / Vue Router 的 API 自动导入，页面和组件中无需手写 import

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

## 🏛️ 构建

`bun run build` 的流程：

1. Vue Router 扫描 `pages/` 生成路由，并读取每篇 Markdown 的 frontmatter 写入路由 `meta`
2. `unplugin-vue-markdown` 把 Markdown 转成 Vue 组件，代码块由 Shiki 在构建时完成高亮
3. `vite-ssg` 逐个渲染所有路由，每个页面输出为独立的 HTML 文件，例如 `/blogs/hello-world` 对应 `dist/blogs/hello-world/index.html`

因为每个页面都是现成的 HTML 文件，`dist/` 可以直接部署到任何静态托管服务，不需要额外配置路由回退。

## ☁️ 部署到 Vercel

### 1. 准备仓库

把项目推送到自己的 GitHub 仓库（Fork 本仓库也可以）。部署前先在本地确认能构建成功：

```bash
bun install
bun run build
```

### 2. 导入项目

1. 用 GitHub 账号登录 [Vercel](https://vercel.com/)
2. 在控制台点击 **Add New… → Project**，选择博客所在的仓库并点击 **Import**
3. 第一次使用时需要授权 Vercel 访问 GitHub 仓库，可以只授权这一个仓库

### 3. 配置构建

Vercel 会自动识别为 **Vite** 项目，并根据 `bun.lock` 使用 Bun 安装依赖。确认以下配置即可，一般无需修改：

| 配置项 | 值 |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` |
| Install Command | `bun install` |
| Build Command | `bun run build` |
| Output Directory | `dist` |

本项目不需要任何环境变量。点击 **Deploy**，一两分钟后会得到一个 `*.vercel.app` 的访问地址。

> [!TIP]
> 如果构建日志提示 Node.js 版本过低，在 **Settings → Build and Deployment → Node.js Version** 中选择 20 或更高版本。

### 4. 自动部署

导入后 Vercel 会监听仓库：

- 推送到 `main` 分支：自动构建并发布到正式环境
- 推送到其他分支或提交 Pull Request：生成独立的预览地址，方便发布前检查

所以日常写文章只需要在 `pages/blogs/` 下新建 Markdown，提交并推送即可。

### 5. 绑定自定义域名（可选）

1. 进入项目 **Settings → Domains**，输入自己的域名并添加
2. 按页面提示到域名服务商处添加 DNS 记录：根域名添加 `A` 记录，子域名（如 `blog.example.com`）添加 `CNAME` 记录，具体值以 Vercel 页面显示为准
3. DNS 生效后 Vercel 会自动签发 HTTPS 证书

### 6. 使用 Vercel CLI 部署（可选）

不想关联 GitHub 时，也可以在本地直接部署：

```bash
bunx vercel login   # 登录
bunx vercel         # 部署到预览环境，首次运行会引导关联项目
bunx vercel --prod  # 部署到正式环境
```

### 常见问题

- **页面出现 404，或查看网页源代码看不到文章内容**：确认 Build Command 是 `bun run build`（即 `vite-ssg build`），而不是 `vite build`。后者只会生成一个 `index.html`，不会预渲染各个页面。
- **依赖安装失败或版本不一致**：确认 `bun.lock` 已提交，且仓库里没有 `package-lock.json` 等其他锁文件。

## 📄 许可

文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。
