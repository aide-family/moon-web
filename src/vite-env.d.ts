/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAIN_MODE?: 'micro' | 'integrated'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
