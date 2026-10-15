// import { createApp } from 'vue'

// import 'markdown-it-github-alerts/styles/github-colors-light.css'
// import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
// import 'markdown-it-github-alerts/styles/github-base.css'
// import '@shikijs/twoslash/style-rich.css'
// import 'shiki-magic-move/style.css'
import './styles/globals.css'
import { routes } from "vue-router/auto-routes"
import { ViteSSG } from 'vite-ssg'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js'

import App from './App.vue'
// createApp(App).mount('#app')


export const createApp = ViteSSG(
    App,
    {
        routes,
    },
    ({ router, app, isClient }) => {
        dayjs.extend(LocalizedFormat)


    },
)
