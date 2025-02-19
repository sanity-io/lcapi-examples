/// <reference types="vinxi/types/client" />
import {StartClient} from '@tanstack/start'
import {hydrateRoot} from 'react-dom/client'
import {createRouter} from './router'
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
