/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declaración de módulo para react-dom/client (resuelve el error de tipos)
declare module 'react-dom/client';
