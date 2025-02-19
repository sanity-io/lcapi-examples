/// <reference types="vinxi/types/client" />
import {StartClient} from '@tanstack/start'
import {injectSpeedInsights} from '@vercel/speed-insights'
import {hydrateRoot} from 'react-dom/client'
import {createRouter} from './router'

injectSpeedInsights()

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
