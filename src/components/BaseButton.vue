<template>
  <button
    :class="styles"
    :alt="alt || text"
    :disabled="disabled || loading"
    type="submit"
    :size="size"
    :title="title"
    @click="performAction"
  >
    <font-awesome-icon v-if="loading" size="sm" icon="spinner" spin />
    <font-awesome-icon v-if="icon" class="mx-1" :icon="icon" />
    <slot>{{ text }}</slot>
    <font-awesome-icon v-if="suffixIcon" class="mx-1" :icon="suffixIcon" />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    action: {
      type: Function,
      default: () => {},
    },
    text: String,
    alt: String,
    title: String,
    type: String,
    size: String,
    icon: String,
    suffixIcon: String,
  },
  data() {
    return {
      disabled: false,
      loading: false,
      styles: {
        'text-lg': this.size === 'large',
        'text-base': this.size === 'medium',
        small: this.size === 'small',

        primary: this.type === 'primary',
        danger: this.type === 'danger',
        warning: this.type === 'warning',
        link: this.type === 'link',
        bare: this.type === 'bare',
        flex: true,
        'items-center': true,
        'justify-center': true,
      },
    };
  },
  methods: {
    async performAction() {
      this.disabled = true;
      this.loading = true;

      try {
        await this.action();
      } catch (e) {
        // TODO: expose method for handling button exceptions
      } finally {
        this.disabled = false;
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
