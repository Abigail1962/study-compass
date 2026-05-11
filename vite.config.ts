import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackBuildConfig } from '@tanstack/start/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 8080,
  }
})
