/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Material-UI components
          'mui-core': [
            '@mui/material',
            '@mui/icons-material', 
            '@mui/system',
            '@emotion/react',
            '@emotion/styled'
          ],
          
          // Service layer - already dynamically imported
          // Keep services separate for better caching
          
          // Component libraries by type
          'components-atoms': [
            './src/components/atoms/index.ts'
          ],
          'components-molecules': [
            './src/components/molecules/index.ts'
          ],
          'components-organisms': [
            './src/components/organisms/index.ts'
          ],
          'components-templates': [
            './src/components/templates/index.ts'
          ],
          
          // Chinese language processing
          'chinese-processing': [
            'pinyin-pro',
            // Add other Chinese processing libraries here
          ],
          
          // Audio processing
          'audio-processing': [
            // Audio-related libraries would go here
          ],
        },
      },
    },
    // Enable chunk size warning for chunks > 500kb
    chunkSizeWarningLimit: 500,
    // Increase size limit for dev to handle large chunks during development
    target: 'esnext',
    minify: 'terser',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        '**/*.config.ts',
        'dist/',
      ],
    },
  },
});
