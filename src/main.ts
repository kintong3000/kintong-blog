import './styles/globals.css'
import { routes } from "vue-router/auto-routes"
import { ViteSSG } from 'vite-ssg'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js'

import App from './App.vue'

export const createApp = ViteSSG(
    App,
    {
        routes,
    },
    () => {
        dayjs.extend(LocalizedFormat)
    },
)
