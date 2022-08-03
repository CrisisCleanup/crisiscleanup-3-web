<template>
  <div>
    <div class="w-full h-full z-40" @click="toggleComponent">
      <slot name="button">
        <div class="w-full h-full flex items-center justify-center">
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
      class="phone-component fixed ml-12 z-30"
      :style="{ top: top }"
      :class="[componentClass, 'w-144 -ml-144']"
      v-show="showComponent"
    >
      <div class="w-full relative mb-2 z-40">
        <ccu-icon
          :alt="$t('actions.cancel')"
          size="xs"
          type="cancel"
          class="absolute right-0 p-2"
          @click.native="
            () => {
              showComponent = false;
            }
          "
        />
      </div>
      <div class="mt-10 sm:mt-0 h-full">
        <slot name="component"></slot>
      </div>
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

<style scoped>
.phone-component {
  transform: translateY(-3rem);
  min-height: 10rem;
  max-height: 50rem;
  @apply shadow-lg bg-white sm:mt-24 h-full overflow-auto;
}
@media only screen and (max-device-width: 1223px) and (orientation: landscape) {
  .phone-component {
    @apply mt-16;
  }
}
</style>
