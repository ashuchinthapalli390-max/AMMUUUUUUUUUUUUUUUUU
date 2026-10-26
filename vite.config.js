import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins:[react()],
  base:'/',
  server:{
    host:'127.0.0.1',port:5173,strictPort:true,
    proxy:{'/api':{target:'http://127.0.0.1:4173',changeOrigin:false,secure:false}}
  },
  preview:{host:'127.0.0.1',port:5173},
  build:{
    outDir:'dist',
    emptyOutDir:true,
    sourcemap:false,
    target:'es2022',
    rollupOptions:{
      external:[/^\/js\/.*/]
    }
  },
  publicDir:'public'
});
