/// <reference types="vite/client" />
/// <reference types="vue/macros" />
/// <reference types="vue/macros-global" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_APP_API_BASE_URL: string;
  readonly VITE_APP_PHONE_DEFAULT_USERNAME: string;
  readonly VITE_APP_PHONE_DEFAULT_PASSWORD: string;
  readonly VITE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN: string;
  readonly VITE_APP_WHAT_3_WORDS_API_KEY: string;
  readonly VITE_APP_DEFAULT_CALLER_ID: string;
  readonly VITE_APP_CRISISCLEANUP_WEB_CLIENT_ID: string;
  readonly VITE_APP_ENGLISH_PHONE_GATEWAY: string;
  readonly VITE_APP_SPANISH_PHONE_GATEWAY: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_STAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
