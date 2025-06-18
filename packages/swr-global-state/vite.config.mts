import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SwrGlobalState',
      fileName: (format) => {
        if (format === 'es') return 'swr-global-state.esm.js';
        if (format === 'cjs') return 'index.js';
        return `swr-global-state.${format}.js`;
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'swr'],
      output: {
        exports: 'named', // This ensures only named exports
        interop: 'compat', // Add this for better compatibility
        globals: {
          react: 'React',
          swr: 'SWR'
        }
      }
    }
  }
});
