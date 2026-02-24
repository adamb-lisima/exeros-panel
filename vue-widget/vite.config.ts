import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { transformAssetUrls } from 'vite-plugin-vuetify';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
      customElement: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      styles: resolve(__dirname, 'src/style')
    }
  },
  build: {
    rollupOptions: {
      input: 'src/main-ce.ts',
      output: {
        entryFileNames: 'vue-widget.js',
        format: 'es',
        inlineDynamicImports: true
      },
      external: []
    },
    cssCodeSplit: false,
    cssMinify: true,
    minify: true
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },
  optimizeDeps: {
    include: ['element-plus', '@element-plus/icons-vue']
  }
});
