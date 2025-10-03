/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_GITHUB_TOKEN: string;
  readonly VITE_GITHUB_OWNER: string;
  readonly VITE_GITHUB_REPO: string;
  readonly VITE_GITHUB_BRANCH: string;
  readonly VITE_DICTIONARY_API_URL?: string;
  readonly VITE_DICTIONARY_API_KEY?: string;
  readonly VITE_MAX_CONTENT_LENGTH: string;
  readonly VITE_MAX_VOCABULARY_SUGGESTIONS: string;
  readonly VITE_AUTO_SAVE_INTERVAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}