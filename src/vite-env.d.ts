/// <reference types="vite/client" />

// Viteのimport.meta.glob型定義追加
interface ImportMeta {
  glob: (pattern: string, options?: { eager?: boolean; as?: string }) => Record<string, unknown>;
}
