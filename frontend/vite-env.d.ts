/// <reference types="vite/client" />

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_REMOTE_SQLITE_GZ_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
