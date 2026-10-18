# Kintong's Blog

English | [简体中文](./README.md)

A static blog built with Vue 3 + Vite. Posts are written in Markdown, pre-rendered into plain static HTML at build time, and deployed on Vercel.

## ✨ Features

- **Markdown writing**: every `.md` file under `pages/` is a page, and its file path is its route
- **Static site generation**: `vite-ssg` pre-renders every page for a fast first load and good SEO
- **Code blocks**: highlighted by Shiki at build time, with titles, line highlighting, diffs, line numbers, word wrap, copy, download, and folding for long code
- **Reading experience**: typography tuned for Chinese text, a table of contents that highlights the current section as you scroll, and GitHub-style alerts
- **Light / dark mode**: switching plays a circular reveal transition
- **Tag filtering**: the blog list is grouped by year and can be filtered by tag

## 🛠️ Tech Stack

| Purpose | Choice |
|---|---|
| Framework | [Vue 3](https://vuejs.org/) + TypeScript |
| Build | [Vite](https://vitejs.dev/) + [vite-ssg](https://github.com/antfu-collective/vite-ssg) |
| Routing | [Vue Router](https://router.vuejs.org/) (file-based routing) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn-vue](https://www.shadcn-vue.com/) |
| Markdown | [unplugin-vue-markdown](https://github.com/unplugin/unplugin-vue-markdown) + [Shiki](https://shiki.style/) |
| Animation | [motion-v](https://motion.dev/docs/vue) |
| Auto imports | [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components), [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) |
| Package manager | [Bun](https://bun.sh/) |

## 🚀 Local Development

Requirements: [Node.js](https://nodejs.org/) >= 20.19, [Bun](https://bun.sh/) >= 1.4

```bash
git clone https://github.com/kintong3000/kintong-blog.git
cd kintong-blog
bun install

bun run dev      # start the dev server at http://localhost:5173
bun run build    # type-check and build to dist/
bun run preview  # preview the build locally
```

> [!NOTE]
> This project uses Bun only. Don't install dependencies with npm / pnpm / yarn; their lockfiles are ignored in `.gitignore`.

## ✍️ Writing Posts

Create a `.md` file under `pages/blogs/`. The file name becomes the post URL, e.g. `pages/blogs/hello-world.md` maps to `/blogs/hello-world`.

### Frontmatter

```yaml
---
title: Post title
date: 2024-04-08
tags:
  - Server
draft: true            # optional, drafts are hidden from the blog list
redirect: https://...  # optional, the list links here instead
---
```

Only posts with a `date` appear in the blog list.

### Table of Contents

Put `[[toc]]` at the top of the post to show a table of contents on the left side of the page (on large screens). It covers h1 to h4.

### Code Blocks

````md
```ts title="main.ts" {2}
const a = 1
const b = 2 // line 2 is highlighted
console.log(a) // [!code ++]
console.log(b) // [!code --]
```
````

- `title="..."`: file name shown in the header and used when downloading; the language name is shown if omitted
- `{1,3-5}`: highlight specific lines
- `// [!code ++]`, `// [!code --]`, `// [!code highlight]`: mark added, removed, or highlighted lines
- Code blocks longer than 15 lines are folded automatically

### Alerts

```md
> [!NOTE]
> Extra information

> [!WARNING]
> Something to watch out for
```

Supported types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`.

## 📂 Project Structure

```
.
├── pages/                    # pages, file path = route
│   ├── index.md              # home page
│   ├── email.vue             # contact
│   └── blogs/
│       ├── index.md          # blog list
│       └── *.md              # posts
├── plugins/
│   └── markdownCodeBlock.ts  # renders code blocks into CodeBlock components at build time
├── public/                   # static assets, copied as-is to dist/
├── src/
│   ├── components/           # components (auto-imported)
│   │   ├── icons/            # icon components
│   │   └── ui/               # shadcn-vue components
│   ├── lib/                  # shadcn-vue helpers
│   ├── styles/               # global styles, post typography, TOC styles
│   ├── types/                # type definitions
│   ├── utils/                # utilities
│   ├── App.vue
│   └── main.ts
└── vite.config.ts            # Vite, Markdown and routing config
```

## 🏛️ Build & Deployment

What `bun run build` does:

1. Vue Router scans `pages/` to generate routes, and reads each Markdown file's frontmatter into the route `meta`
2. `unplugin-vue-markdown` turns Markdown into Vue components, with code blocks highlighted by Shiki at build time
3. `vite-ssg` renders every route and writes static HTML to `dist/`

Once the project is linked to Vercel, every push to GitHub automatically builds and deploys `dist/`.

## 📄 License

Post content is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
