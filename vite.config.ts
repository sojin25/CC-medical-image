import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // ファイル名に 'comments' が含まれているかチェック
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          const isComment = assetInfo.name.includes('comments/');
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            // commentsフォルダ内の画像は別の場所に出力
            if (isComment) {
              return `assets/comments/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  }
});
