<template>
  <div class="phone-system-action">
    <div
      class="phone-system-action__button"
      :class="showComponent ? 'phone-system-action__button--active' : ''"
      @click="toggleComponent"
    >
      <slot name="button">
        <div class="phone-system-action__icon">
          <ccu-icon
            v-if="icon"
            :type="icon"
            :class="iconClass"
            :size="iconSize"
          />
        </div>
      </slot>
    </div>
    <div
      class="phone-system-action__content"
      :class="componentClass"
      :style="componentStyle"
      v-show="showComponent"
    >
      <div class="phone-system-action__close">
        <ccu-icon
          :alt="$t('actions.cancel')"
          size="xs"
          type="cancel"
          class="phone-system-action__close-icon"
          @click.native="() => (showComponent = false)"
        />
      </div>
      <slot name="component"></slot>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/event-bus';
export default {
  name: 'PhoneComponentButton',
  created() {
    EventBus.$on('phone_component:close', () => {
      this.showComponent = this.keepOpen;
    });
    EventBus.$on('phone_component:open', (name) => {
      if (this.name === name) {
        EventBus.$emit('phone_component:close');
        this.showComponent = true;
      }
    });
  },
  data() {
    return {
      showComponent: false,
      top: 0,
    };
  },
  props: {
    name: { type: String, default: null, required: true },
    icon: { type: String, default: null, required: false },
    iconClass: { type: String, default: null, required: false },
    componentClass: { type: String, default: null, required: false },
    componentStyle: { type: String, default: null, required: false },
    iconSize: { type: String, default: null, required: false },
    keepOpen: { type: Boolean, default: false, required: false },
  },
  methods: {
    mounted() {
      if (this.keepOpen) {
        this.showComponent = true;
      }
    },
    toggleComponent() {
      if (this.keepOpen) {
        this.showComponent = true;
      } else {
        const newState = !this.showComponent;
        EventBus.$emit('phone_component:close');
        this.showComponent = newState;
      }
    },
  },
  watch: {
    showComponent(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.$emit('open');
        const el = this.$parent.$refs.phoneButtons;
        const rect = el.getBoundingClientRect();
        this.top = `${parseInt(rect.top + window.scrollY)}px`;
      }
    },
  },
};
</script>

<style lang="postcss" scoped>
.phone-system-action {
  &__button {
    @apply w-full h-full cursor-pointer z-40;
    &--active {
      @apply bg-gray-100 border-l-2 border-l-primary-light;
    }
  }

  &__content {
    @apply shadow-lg
    bg-white
    shadow-md
    absolute top-1 mr-1 z-30
    overflow-auto;
    min-height: 10vh;
    height: 100%;
  }

  &__icon {
    @apply w-full h-full flex items-center justify-center;
  }

  &__close {
    @apply w-full relative mb-2 z-40;
    &-icon {
      @apply absolute right-0 p-2 cursor-pointer;
    }
  }
}
</style>
