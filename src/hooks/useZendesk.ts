import { reactive } from 'vue';
import { createInjectionState } from '@vueuse/shared';
import { useMutationObserver, tryOnMounted } from '@vueuse/core';

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
  /**
   * Make a field hidden.
   *
   * @remarks
   * This is not a zendesk field and is implemented within this hook.
   */
  hidden?: boolean;
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
    const zeWindow = computed(() => window as typeof window & { zE?: Zendesk });

    const _zeContainer = ref<HTMLDivElement | undefined>(undefined);
    const _zeWidgetFrame = ref<HTMLIFrameElement | undefined>(undefined);
    const _configFields = computed<ContactFormField[]>(
      () => config.webWidget?.contactForm?.fields ?? [],
    );

    const isOpen = computed<boolean>(() => _zeWidgetFrame.value !== undefined);

    // Look for zendesk button iframe to find the parent container
    // in which it and the form, as the form is added/removed from the dom tree
    // dynamically.
    const handleOnMounted = async () => {
      await nextTick(() => {
        const zeButtonFrame =
          zeWindow.value?.document?.querySelector?.('iframe#launcher');
        if (zeButtonFrame) {
          _zeContainer.value = zeButtonFrame?.parentElement as HTMLDivElement;
        }
      });
    };

    // Observe container to watch for the widget iframe node being added/removed.
    useMutationObserver(
      _zeContainer,
      (mutations) => {
        // zeContainer also holds the label, which gets destroyed
        const isWidgetNode = (c: Node): boolean =>
          'id' in c && c.id === 'webWidget';
        const widgetFrameAdded = mutations.find((mut) =>
          // eslint-disable-next-line unicorn/prefer-spread
          Array.from(mut.addedNodes).some(isWidgetNode),
        );
        if (!widgetFrameAdded) {
          if (
            mutations.some((mut) =>
              // eslint-disable-next-line unicorn/prefer-spread
              Array.from(mut.removedNodes).some(isWidgetNode),
            )
          ) {
            _zeWidgetFrame.value = undefined;
          }

          return;
        }

        const node = widgetFrameAdded.addedNodes.item(0);
        _zeWidgetFrame.value = node as HTMLIFrameElement;
      },
      { childList: true },
    );

    const zE: Zendesk = <ArgsT extends Parameters<Zendesk>>(
      ...args: ArgsT
    ): void => {
      // if zendesk if blocked or fails to load in some fashion,
      // zE may not be defined.
      zeWindow.value.zE?.(...(args as Parameters<Zendesk>));
    };

    // reactively update zendesk config
    watch(
      () => config,
      (newValue) => {
        zE(ZendeskTarget.WEB_WIDGET, ZendeskCommand.UPDATE_SETTINGS, newValue);
      },
      { deep: true, immediate: true },
    );

    // implement {@link ContactFormField} hidden property
    zE(
      ZendeskTarget.WEB_WIDGET_ON,
      ZendeskOnEvent.USER_EVENT,
      async (zendeskEvent) => {
        if (zendeskEvent && zendeskEvent.action === 'Contact Form Shown') {
          await Promise.allSettled(
            _configFields.value
              .filter((field) => field.hidden)
              .map(async (field) =>
                nextTick(() => {
                  const selector = `label[data-fieldid='key:${field.id}']`;
                  const fieldLabel =
                    _zeWidgetFrame.value?.contentDocument?.querySelector?.(
                      selector,
                    );
                  fieldLabel?.parentElement?.style?.setProperty(
                    'display',
                    'none',
                  );
                }),
              ),
          );
        }
      },
    );

    tryOnMounted(handleOnMounted);

    return {
      config,
      zeWindow,
      zE,
      isOpen,
    };
  },
);

export { useProvideZendesk, useZendesk };
