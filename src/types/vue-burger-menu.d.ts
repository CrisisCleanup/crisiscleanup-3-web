// Type definitions for vue-select 2.5
// Project: https://github.com/mbj36/vue-burger-menu
// Definitions by: Sergey Shevchenko <https://github.com/sergeykons>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

import { VueConstructor } from 'vue';

declare module 'vue-burger-menu';

export interface MenuConstructor extends VueConstructor {
  data: () => {
    isSideBarOpen: boolean;
  };
  props: {
    isOpen?: boolean;
    right?: boolean;
    width?: string;
    disableEsc?: boolean;
    noOverlay?: boolean;
    onStateChange?: () => any;
    burgerIcon: boolean;
    crossIcon: boolean;
    disableOutsideClick?: boolean;
    closeOnNavigation?: boolean;
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    closeMenuOnEsc: (e: Event) => void;
    documentClick: (e: Event) => void;
    hasClass: (element: HTMLElement, className: string) => void;
    mounted: () => void;
    created: () => void;
    destroyed: () => void;
  };
  watch: {
    isOpen: () => void;
    right: () => void;
  };
}

export interface SlideConstructor extends VueConstructor {
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
  };
}

export interface BubbleConstructor extends VueConstructor {
  data: () => {
    propsToPass: {
      isOpen?: boolean;
      right?: boolean;
      width?: string;
      disableEsc?: boolean;
      noOverlay?: boolean;
      onStateChange: () => any;
    };
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
  };
}

export interface RevealConstructor extends VueConstructor {
  data: () => {
    bodyOldStyle: string;
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    push: () => void;
    pull: () => void;
  };
}

export interface PushConstructor extends VueConstructor {
  data: () => {
    bodyOldStyle: string;
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    push: () => void;
    pull: () => void;
  };
}

export interface PushRotateConstructor extends VueConstructor {
  data: () => {
    bodyOldStyle: string;
    appOldStyle: string;
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    push: () => void;
    pull: () => void;
  };
}

export interface ScaleDownConstructor extends VueConstructor {
  data: () => {
    bodyOldStyle: string;
    appOldStyle: string;
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    push: () => void;
    pull: () => void;
  };
}

export interface ScaleRotateConstructor extends VueConstructor {
  data: () => {
    bodyOldStyle: string;
    appOldStyle: string;
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    push: () => void;
    pull: () => void;
  };
}

export interface StackConstructor extends VueConstructor {
  data: () => {
    propsToPass: {
      isOpen?: boolean;
      right?: boolean;
      width?: string;
      disableEsc?: boolean;
      noOverlay?: boolean;
      onStateChange: () => any;
    };
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
  };
}

export interface FallDownConstructor extends VueConstructor {
  data: () => {
    bodyOldStyle: string;
    propsToPass: {
      isOpen?: boolean;
      right?: boolean;
      width?: string;
      disableEsc?: boolean;
      noOverlay?: boolean;
      onStateChange: () => any;
    };
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    mounted: () => void;
  };
}

export interface ElasticConstructor extends VueConstructor {
  data: () => {
    bodyOldStyle: string;
    propsToPass: {
      isOpen?: boolean;
      right?: boolean;
      width?: string;
      disableEsc?: boolean;
      noOverlay?: boolean;
      onStateChange: () => any;
    };
  };
  methods: {
    openMenu: () => void;
    closeMenu: () => void;
    mounted: () => void;
  };
}

export const Menu: MenuConstructor;
export const Slide: SlideConstructor;
export const Bubble: BubbleConstructor;
export const Reveal: RevealConstructor;
export const Push: PushConstructor;
export const PushRotate: PushRotateConstructor;
export const ScaleDown: ScaleDownConstructor;
export const ScaleRotate: ScaleRotateConstructor;
export const Stack: StackConstructor;
export const FallDown: FallDownConstructor;
export const Elastic: ElasticConstructor;
