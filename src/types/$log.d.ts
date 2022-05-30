declare module 'vue/types/vue' {
  interface Vue {
    $log: {
      info(message: string, trace?: {}): void;
      warning(message: string, trace?: {}): void;
      error(message: string, trace?: {}): void;
    };
  }
}
