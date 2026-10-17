# Personal Blog Website

This is a modern, high-performance static blog website built with Vue 3 and Vite.

## ✨ Features

- **📄 Markdown Driven** - Blog posts and page content are generated from Markdown files.
- **🚀 Static Site Generation (SSG)** - Uses `vite-ssg` to pre-render the website into static HTML, delivering extreme loading speeds and excellent SEO.
- **☁️ Automated Deployment** - Can be deployed for free on platforms like [Vercel](https://vercel.com/), with automatic updates upon code commits.

## 🛠️ Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [vue-router](https://router.vuejs.org/) (built-in file-based routing)
- **CSS:** [Tailwind CSS](https://tailwindcss.com)
- **Markdown Parsing:** [unplugin-vue-markdown](https://github.com/unplugin/unplugin-vue-markdown)
- **Static Site Generation (SSG):** [vite-ssg](https://github.com/antfu/vite-ssg)
- **Auto Imports:**
  - [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
  - [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import)

## 📂 Project Structure

```
.
├── pages/                  # Page and route components
│   ├── index.md            # Website homepage
│   └── blogs/              # Blog posts directory
│       ├── index.md        # Blog list page
│       └── *.md            # Individual blog posts
├── src/
│   ├── App.vue             # Root Vue application component
│   ├── main.js             # Application entry point
│   ├── components/         # Global Vue components (auto-imported)
│   │   └── icons/          # Icon components
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets, copied as-is to dist/
└── vite.config.js          # Vite configuration file
```

## 🚀 Local Development

**Prerequisites:**

- [Node.js](http://nodejs.org/) >= 18
- [Bun](https://bun.sh/) >= 1.4

**Steps:**

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-repo/kintong3000.me.git
    cd kintong3000.me
    ```

2.  **Install dependencies**
    ```bash
    bun install
    ```

3.  **Start the development server**
    This command starts a hot-reloading development server, usually available at `http://localhost:5173`.
    ```bash
    bun run dev
    ```

4.  **Build the project**
    This command builds the entire website into static files, outputting them to the `dist/` directory.
    ```bash
    bun run build
    ```

5.  **Preview the build locally**
    This command starts a local server to preview the static files from the `dist/` directory.
    ```bash
    bun run preview
    ```

## 🏛️ Architecture & Deployment

The core of this project is the combination of a **Static Site Generation (SSG)** architecture and the automated deployment pipeline (CI/CD) from platforms like **Vercel**.

This allows developers to focus solely on creating content, while the build and deployment processes are handled automatically.

### Static Site Generation (SSG) Workflow

When the `bun run build` command is executed, the project converts the source code and Markdown content into a complete, purely static website. The process is as follows:

1.  **Content Scanning**: Vue Router's built-in file-based routing plugin scans the structure of the `pages/` directory and automatically generates the corresponding website routes.
2.  **Content Transformation**: The `unplugin-vue-markdown` plugin reads all `.md` files and converts their content into Vue components.
3.  **Page Pre-rendering**: The `vite-ssg` tool simulates a visit to every page of the site, executes the corresponding Vue components, and captures the final rendered output as plain HTML files.
4.  **Artifact Output**: All generated HTML, CSS, and JavaScript files are placed in the `dist/` directory, which contains the entire deployable website.

### Vercel's Automated Deployment Flow

Once the project is linked to Vercel, every `git push` triggers an automated deployment:

1.  **Local Commit**: You modify code or update an article in the `pages/` directory and push the changes to your GitHub repository using `git push`.
2.  **Trigger Deployment**: GitHub notifies Vercel of the update via a webhook.
3.  **Cloud Build**: Vercel pulls the latest code and automatically runs the `bun run build` command, completing the SSG process in the cloud.
4.  **Atomic Deployment**: After a successful build, Vercel deploys the `dist/` directory to its global CDN and instantly points your domain to the new version. This process is seamless and ensures no downtime.
