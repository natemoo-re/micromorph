import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url';

export default defineConfig({
    appType: 'mpa',
    build: {
        rollupOptions: {
            input: {
               main: fileURLToPath(new URL("./index.html", import.meta.url)),
               a: fileURLToPath(new URL("./a.html", import.meta.url)),
               b: fileURLToPath(new URL("./b.html", import.meta.url)),
               c: fileURLToPath(new URL("./c.html", import.meta.url)),
            }
        }
    }
})
