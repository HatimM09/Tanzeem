import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tanzeem Management Portal',
        short_name: 'Tanzeem',
        start_url: '/',
        display: 'standalone',
        background_color: '#0c0e14',
        theme_color: '#D4AF37',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}
  return { plugins };
})
