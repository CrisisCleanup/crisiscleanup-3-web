import { reactive } from 'vue';
import { createInjectionState } from '@vueuse/shared';

interface WebWidgetColor {
  theme: string;
  launcher: string;
  launcherText: string;
  button: string;
  resultLists: string;
  header: string;
  articleLinks: string;
}

interface ContactFormField {
  /**
   * Field ID.
   * Can be string name of predefined Zendesk field
   * or numerical id of custom field.
   * Custom fields must be defined in zendesk admin settings.
   * @see https://developer.zendesk.com/api-reference/widget/settings/#fields
   */
  id: string | number;
  prefill?: Record<string, string>;
}

interface WebWidgetContactForm {
  suppress?: boolean;
  fields?: ContactFormField[];
}

interface WebWidget {
  color?: Partial<WebWidgetColor>;
  position?: { horizontal?: 'left' | 'right'; vertical?: 'top' | 'bottom' };
  offset?: { horizontal?: string };
  contactForm?: WebWidgetContactForm;
}

/**
 * Partially typed config
 * @see https://developer.zendesk.com/api-reference/widget/settings/
 */
export interface ZendeskConfig {
  webWidget: WebWidget;
}

/**
 * `zE` target for {@link useZendesk} hook.
 */
export enum ZendeskTarget {
  WEB_WIDGET = 'webWidget',
  WEB_WIDGET_ON = 'webWidget:on',
  WEB_WIDGET_GET = 'webWidget:get',
}

/**
 * Commands for {@link ZendeskTarget.WEB_WIDGET} target.
 */
export enum ZendeskCommand {
  CLEAR = 'clear',
  CLOSE = 'close',
  HIDE = 'hide',
  IDENTIFY = 'identify',
  LOGOUT = 'logout',
  OPEN = 'open',
  PREFILL = 'prefill',
  RESET = 'reset',
  SET_LOCALE = 'setLocale',
  SHOW = 'show',
  TOGGLE = 'toggle',
  UPDATE_PATH = 'updatePath',
  UPDATE_SETTINGS = 'updateSettings',
}

/**
 * Commands for {@link ZendeskTarget.WEB_WIDGET_ON} target.
 */
export enum ZendeskOnEvent {
  OPEN = 'open',
  USER_EVENT = 'userEvent',
  CLOSE = 'close',
}

/**
 * Commands for {@link ZendeskTarget.WEB_WIDGET_GET} target.
 */
export enum ZendeskGetCommand {
  DISPLAY = 'display',
}

/**
 * Callback parameter for `{@link ZendeskTarget.WEB_WIDGET_ON}` events.
 */
interface ZendeskEvent {
  action: unknown;
  properties: unknown;
  category: unknown;
}

/**
 * Zendesk Core API
 * @see https://developer.zendesk.com/api-reference/widget/core/#commands
 */
export interface Zendesk {
  (target: ZendeskTarget.WEB_WIDGET_GET, command: ZendeskGetCommand): void;
  (
    target: ZendeskTarget.WEB_WIDGET,
    command: ZendeskCommand,
    options?: Record<string, unknown>,
  ): void;
  (
    target: ZendeskTarget.WEB_WIDGET_ON,
    command: ZendeskOnEvent,
    options?: (zendeskEvent: ZendeskEvent) => void,
  ): void;
}

const [useProvideZendesk, useZendesk] = createInjectionState(
  (initialConfig: ZendeskConfig) => {
    const config = reactive(initialConfig);
    const zeWindow = computed(() => window as typeof window & { zE: Zendesk });

    const zE: Zendesk = <ArgsT extends Parameters<Zendesk>>(
      ...args: ArgsT
    ): void => {
      zeWindow.value.zE(...(args as Parameters<Zendesk>));
    };

    // reactively update zendesk config
    watch(
      () => config,
      (newValue) => {
        zE(ZendeskTarget.WEB_WIDGET, ZendeskCommand.UPDATE_SETTINGS, newValue);
      },
      { deep: true, immediate: true },
    );

    return {
      config,
      zeWindow,
      zE,
    };
  },
);

export { useProvideZendesk, useZendesk };
