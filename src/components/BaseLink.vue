<template>
  <component
    :is="linkComponent"
    :to="to"
    :href="href"
    class="link"
    :target="target"
  >
    <base-text :variant="textVariant">
      <slot />
    </base-text>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'BaseLink',
  props: {
    href: {
      type: String,
      default: '',
    },
    textVariant: {
      type: String,
      default: 'body',
    },
    to: null,
    target: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const linkComponent = computed(() => (props.to ? 'router-link' : 'a'));

    return {
      linkComponent,
    };
  },
});
</script>

<style scoped lang="scss">
.link {
  @apply text-primary-dark;
  text-decoration: underline;
  &:hover {
    text-decoration: none;
  }
}
</style>
