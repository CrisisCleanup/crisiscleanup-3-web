<template>
  <button
    :class="[styles, buttonSelector]"
    :alt="alt || text"
    :disabled="disabled || loading"
    type="submit"
    :size="size"
    :title="buttonTitle"
    :data-cy="buttonSelector"
    @click.prevent="performAction"
  >
    <font-awesome-icon
      v-if="loading || showSpinner"
      size="sm"
      icon="spinner"
      spin
    />
    <font-awesome-icon v-if="icon" class="m-1" :icon="icon" :size="iconSize" />
    <ccu-icon v-if="ccuIcon" class="m-1" :type="ccuIcon" :size="iconSize" />
    <slot>{{ text }}</slot>
    <font-awesome-icon v-if="suffixIcon" class="m-1" :icon="suffixIcon" />
  </button>
</template>

<script lang="ts">
import { kebabCase } from "lodash";
import { ref, computed, defineComponent, PropType } from "vue";
import { BUTTON_VARIANTS as VARIANTS, ICON_SIZES, ICONS } from "../constants";

type ButtonSize = "small" | "medium" | "large" | "sm" | "md" | "lg";
type IconSize = typeof ICON_SIZES[number];

export default defineComponent({
  name: "BaseButton",

  props: {
    action: {
      type: Function as PropType<() => any>,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showSpinner: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "button",
    },
    title: {
      type: String,
      default: "",
    },
    ccuEvent: {
      type: String,
      default: "",
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    ccuIcon: {
      type: String as PropType<typeof ICONS[keyof typeof ICONS]>,
      default: "",
    },
    iconSize: {
      type: String as PropType<IconSize>,
      default: "",
    },
    suffixIcon: {
      type: String as PropType<typeof ICONS[keyof typeof ICONS]>,
      default: "",
    },
    selector: {
      type: String,
      default: "",
    },
    variant: {
      type: String as PropType<typeof VARIANTS[keyof typeof VARIANTS]>,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
  },

  setup(props) {
    const delay = async (ms) => new Promise((res) => setTimeout(res, ms));
    const loading = ref(false);

    const buttonTitle = computed(() => props.text || props.alt || props.title);

    const buttonSelector = computed(
      () => props.selector || `js-${kebabCase(buttonTitle.value)}`
    );

    const styles = computed(() => {
      const styleObject = {
        "large text-h3 font-h3": ["large", "lg"].includes(props.size),
        "medium text-sans text-h4 font-h4": ["medium", "md"].includes(
          props.size
        ),
        "small text-bodysm font-bodysm": ["small", "sm"].includes(props.size),
        disabled: props.disabled,
        // **** DEPRECATED ****
        primary: props.type === "primary",
        danger: props.type === "danger",
        warning: props.type === "warning",
        link: props.type === "link",
        bare: props.type === "bare",
        // **************
        flex: true,
        "items-center": true,
        "justify-center": true,
        "base-button": true,
      };
      if (props.variant) {
        styleObject[props.variant] = true;
      }
      styleObject[props.variant] = true;
      return styleObject;
    });

    const timeout = async () => {
      await delay(5000);
      return Promise.reject();
    };

    const performAction = async () => {
      loading.value = true;

      try {
        if (props.action) {
          await Promise.race([props.action(), timeout()]);
        }
      } catch (e) {
        // TODO: expose method for handling button exceptions
      } finally {
        // const { logEvent } = useLogEvent();
        // logEvent(props.ccuEvent);
        loading.value = false;
      }
    };

    return {
      loading,
      styles,
      buttonSelector,
      buttonTitle,
      performAction,
    };
  },
});
</script>

<style scoped>
button {
  @apply font-sans;
  cursor: pointer;
  outline: 0;
  transition: all 300ms ease;
}
button:focus {
  outline: 0;
}

/** ----- DEPRECATED ----- */
.primary {
  @apply bg-primary-light;
}
.link {
  @apply text-primary-dark;
}
/** ----- DEPRECATED ----- */

button.solid {
  @apply bg-primary-light;
}

button.solid:hover {
  @apply bg-crisiscleanup-yellow-100;
}

button.solid.disabled {
  @apply bg-crisiscleanup-dark-200 !important;
  @apply text-gray-100;
}

button.outline {
  background-color: transparent;
  border: 1px solid black;
}

button.outline:hover {
  @apply bg-crisiscleanup-dark-500;
  @apply text-gray-100;
}

button.outline.disabled {
  @apply text-crisiscleanup-grey-900;
}

button.outline.disabled:hover {
  @apply text-crisiscleanup-grey-900;
}

button.outline-dark {
  background-color: transparent;
  border: 1px solid white;
}

button.outline-dark:hover {
  @apply bg-crisiscleanup-dark-500;
  @apply text-gray-100;
}

button.outline-dark.disabled {
  @apply text-crisiscleanup-grey-900;
}

button.outline-dark.disabled:hover {
  @apply text-crisiscleanup-grey-900;
}

button.text {
  background-color: transparent;
}

button.text:hover {
  @apply bg-crisiscleanup-grey-100;
}

button.text.disabled {
  @apply text-crisiscleanup-grey-900;
}

button.text.disabled:hover {
  @apply text-crisiscleanup-grey-900;
}

button.small {
  min-height: 24px;
  padding-left: 15px;
  padding-right: 15px;
}

button.medium {
  min-height: 32px;
  padding-left: 20px;
  padding-right: 20px;
}

button.large {
  min-height: 50px;
  padding-left: 34px;
  padding-right: 34px;
}
</style>
