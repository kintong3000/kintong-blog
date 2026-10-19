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
| Auto imports | [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components), [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) |
| Package manager | [Bun](https://bun.sh/) |

## 🎨 Design & Architecture

The design and architecture are based on [Anthony Fu's site antfu.me](https://antfu.me/) ([source](https://github.com/antfu/antfu.me)), with the styling layer swapped for Tailwind CSS v4 + shadcn-vue.

### Architecture

Like antfu.me, the site is built around "Markdown files are pages":

```
pages/*.md ──► unplugin-vue-markdown ──► Vue components ─┐
                (Shiki, TOC, anchors, alerts)             │
                                                          ├──► vite-ssg ──► dist/*.html
pages/*.vue ──────────────────────────────────────────────┤
                                                          │
vue-router file routes ◄── gray-matter reads frontmatter ─┘
        (stored in route.meta, used by the blog list)
```

- **File-based routing**: `vue-router` scans `pages/`; both `.md` and `.vue` are pages. At build time `gray-matter` reads each post's frontmatter into `route.meta.frontmatter`, so the blog list reads posts straight from the route table with no separate data file
- **Layout wrappers**: each Markdown page is wrapped in a component: pages containing `<!-- introduction -->` use `WrapperIntroduction` (home), all others use `WrapperPost` (title, date, TOC highlighting, anchor scrolling)
- **Build-time work**: syntax highlighting and turning code blocks into components (`plugins/markdownCodeBlock.ts`) happen at build time, so no highlighter ships to the client
- **Auto imports**: components and the Vue / VueUse / Vue Router APIs are auto-imported, so pages and components need no manual imports

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

## 🏛️ Build

What `bun run build` does:

1. Vue Router scans `pages/` to generate routes, and reads each Markdown file's frontmatter into the route `meta`
2. `unplugin-vue-markdown` turns Markdown into Vue components, with code blocks highlighted by Shiki at build time
3. `vite-ssg` renders every route to its own HTML file, e.g. `/blogs/hello-world` becomes `dist/blogs/hello-world/index.html`

Since every page is a ready-made HTML file, `dist/` can be deployed to any static host with no routing fallback.

## ☁️ Deploying to Vercel

### 1. Prepare the repository

Push the project to your own GitHub repository (a fork works too). Make sure it builds locally first:

```bash
bun install
bun run build
```

### 2. Import the project

1. Sign in to [Vercel](https://vercel.com/) with your GitHub account
2. In the dashboard, click **Add New… → Project**, pick the blog repository and click **Import**
3. The first time, you need to let Vercel access your GitHub repositories; granting access to this one repository is enough

### 3. Build settings

Vercel detects the project as **Vite** and installs dependencies with Bun because of `bun.lock`. Check these settings; they usually need no changes:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` |
| Install Command | `bun install` |
| Build Command | `bun run build` |
| Output Directory | `dist` |

No environment variables are needed. Click **Deploy**, and after a minute or two you get a `*.vercel.app` URL.

> [!TIP]
> If the build log says the Node.js version is too old, pick 20 or later under **Settings → Build and Deployment → Node.js Version**.

### 4. Automatic deployments

After the import, Vercel watches the repository:

- Pushes to `main` are built and published to production
- Pushes to other branches and pull requests get their own preview URL, so you can check changes before publishing

So writing a post is just adding a Markdown file under `pages/blogs/`, committing and pushing.

### 5. Custom domain (optional)

1. Open the project's **Settings → Domains** and add your domain
2. Add the DNS records Vercel shows at your domain registrar: an `A` record for an apex domain, a `CNAME` record for a subdomain such as `blog.example.com`. Use the exact values shown by Vercel
3. Once DNS propagates, Vercel issues an HTTPS certificate automatically

### 6. Deploying with the Vercel CLI (optional)

If you'd rather not link GitHub, you can deploy from your machine:

```bash
bunx vercel login   # sign in
bunx vercel         # deploy a preview; the first run walks you through linking the project
bunx vercel --prod  # deploy to production
```

### Troubleshooting

- **Pages return 404, or the page source has no post content**: make sure the Build Command is `bun run build` (which runs `vite-ssg build`), not `vite build`. The latter only produces a single `index.html` and does not prerender the pages.
- **Dependency install fails or versions differ**: make sure `bun.lock` is committed and the repository contains no other lock files such as `package-lock.json`.

## 📄 License

Post content is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
