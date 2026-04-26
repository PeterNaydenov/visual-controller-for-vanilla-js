import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'VisualControllerForVanillaJS',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'visual-controller-for-vanilla-js.esm.js'
          case 'cjs':
            return 'visual-controller-for-vanilla-js.cjs'
          case 'umd':
            return 'visual-controller-for-vanilla-js.umd.js'
          default:
            return 'visual-controller-for-vanilla-js.js'
        }
      }
    },
    rollupOptions: {
      external: ['ask-for-promise'],
      output: {
        globals: {
          'ask-for-promise': 'askForPromise'
        },
        exports: 'named'
      }
    }
  }
})