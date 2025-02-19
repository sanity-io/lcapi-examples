import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import { SpeedInsights } from '@vercel/speed-insights/next';


export default function App({Component, pageProps}: AppProps) {
  return <><Component {...pageProps} /><SpeedInsights /></>
}
