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
    <font-awesome-icon v-if="icon" class="mx-1" :icon="icon" :size="iconSize" />
    <ccu-icon v-if="ccuIcon" class="mx-1" :type="ccuIcon" :size="iconSize" />
    <slot>{{ text }}</slot>
    <font-awesome-icon v-if="suffixIcon" class="mx-1" :icon="suffixIcon" />
  </button>
</template>

<script>
import { kebabCase } from 'lodash';

export default {
  name: 'BaseButton',
  props: {
    action: {
      type: Function,
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
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    ccuIcon: {
      type: String,
      default: '',
    },
    iconSize: {
      type: String,
      default: 'sm',
    },
    suffixIcon: {
      type: String,
      default: '',
    },
    selector: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    buttonSelector() {
      return this.selector || `js-${kebabCase(this.buttonTitle)}`;
    },
    buttonTitle() {
      return this.title || this.text || this.alt;
    },
    styles() {
      return {
        'text-lg': this.size === 'large',
        'text-base': this.size === 'medium',
        small: this.size === 'small',
        'text-crisiscleanup-grey-900': this.disabled,

        primary: this.type === 'primary',
        danger: this.type === 'danger',
        warning: this.type === 'warning',
        link: this.type === 'link',
        bare: this.type === 'bare',
        flex: true,
        'items-center': true,
        'justify-center': true,
      };
    },
  },
  methods: {
    async performAction() {
      this.loading = true;

      try {
        await this.action();
      } catch (e) {
        // TODO: expose method for handling button exceptions
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
button {
  outline: 0;
}
button:focus {
  outline: 0;
}
.primary {
  @apply bg-primary-light;
}
.link {
  @apply text-primary-dark;
}
</style>
