# 个人博客网站

这是一个基于 Vue 3 和 Vite 构建的现代化、高性能静态博客网站。

## ✨ 功能特性
- **📄 Markdown 驱动** - 博客文章和页面内容均由 Markdown 文件生成。
- **🚀 静态站点生成 (SSG)** - 通过 `vite-ssg` 预渲染网站为静态 HTML，带来极致的加载速度和优秀的 SEO。
- **☁️ 自动化部署** - 可免费部署在 [Vercel](https://vercel.com/) 等平台，提交代码即可自动更新线上页面。

## 🛠️ 技术栈

- **框架:** [Vue 3](https://vuejs.org/)
- **构建工具:** [Vite](https://vitejs.dev/)
- **路由:** [vue-router](https://router.vuejs.org/)（内置基于文件的路由）
- **CSS:** [Tailwind CSS](https://tailwindcss.com)
- **Markdown 解析:** [unplugin-vue-markdown](https://github.com/unplugin/unplugin-vue-markdown)
- **静态站点生成 (SSG):** [vite-ssg](https://github.com/antfu/vite-ssg)
- **组件/API 自动导入:**
  - [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
  - [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import)

## 📂 项目结构

```
.
├── pages/                  # 页面和路由组件
│   ├── index.md            # 网站首页
│   └── blogs/              # 博客文章目录
│       ├── index.md        # 博客列表页
│       └── *.md            # 具体的博客文章
├── src/
│   ├── App.vue             # Vue 应用根组件
│   ├── main.js             # 应用入口文件
│   ├── components/         # 全局 Vue 组件（自动导入）
│   │   └── icons/          # 图标组件
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── public/                 # 静态资源，原样复制到 dist/
└── vite.config.js          # Vite 配置文件
```

## 🚀 本地开发

**环境要求:**

- [Node.js](http://nodejs.org/) >= 18
- [Bun](https://bun.sh/) >= 1.4

**步骤:**

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-repo/kintong3000.me.git
    cd kintong3000.me
    ```

2.  **安装依赖**
    ```bash
    bun install
    ```

3.  **启动开发服务器**
    此命令会启动一个热重载的开发服务器，访问地址通常是 `http://localhost:5173`。
    ```bash
    bun run dev
    ```

4.  **构建项目**
    此命令会将整个网站构建成静态文件，输出到 `dist/` 目录。
    ```bash
    bun run build
    ```

5.  **本地预览构建结果**
    此命令可以在本地启动一个服务器来预览 `dist/` 目录中的静态文件。
    ```bash
    bun run preview
    ```

## 🏛️ 架构

本项目的核心是**静态站点生成 (SSG)** 架构与 **Vercel** 平台的自动化部署流程（CI/CD）的结合。

这使得开发者只需专注于内容创作，其余的构建和部署工作将自动完成。

### 静态站点生成 (SSG) 工作流

当执行 `bun run build` 命令时，项目会将代码和 Markdown 内容转换为一个完整的、纯静态的网站。这个过程如下：

1.  **内容扫描**：Vue Router 内置的文件路由插件扫描 `pages/` 目录的结构，并自动生成对应的网站路由。
2.  **内容转换**：`unplugin-vue-markdown` 插件读取所有 `.md` 文件，将其内容转换为 Vue 组件。
3.  **页面预渲染**：`vite-ssg` 工具会模拟访问网站的每一个页面，执行对应的 Vue 组件，并将最终渲染结果捕获为纯粹的 HTML 文件。
4.  **产物输出**：所有生成的 HTML、CSS 和 JavaScript 文件被统一输出到 `dist/` 目录。这个目录包含了整个可部署的网站。

### Vercel 自动化部署流程

当项目与 Vercel 关联后，每一次代码提交都会触发一次自动化的部署：

1.  **本地提交**：您在本地修改代码或在 `pages/` 目录下更新文章，然后使用 `git push` 将变更推送到 GitHub 仓库。
2.  **触发部署**：GitHub 通过 Webhook 自动通知 Vercel 代码有更新。
3.  **云端构建**：Vercel 收到通知后，会拉取最新的代码，并自动执行 `bun run build` 命令，在云端完成上述的 SSG 构建流程。
4.  **原子化部署**：构建成功后，Vercel 会将生成的 `dist/` 目录部署到其全球 CDN 网络，并瞬间将您的域名指向这个最新版本，整个过程平滑且无中断。
