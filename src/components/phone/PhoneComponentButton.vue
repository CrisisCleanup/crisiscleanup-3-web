<template>
  <div>
    <div class="w-full h-full" @click="toggleComponent">
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
      class="phone-component absolute"
      :class="[componentClass, $mq === 'sm' ? 'w-120 -ml-120' : 'w-84 -ml-84']"
      v-show="showComponent"
    >
      <div class="w-full relative mb-2">
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
};
</script>

<style scoped>
.phone-component {
  transform: translateY(-3rem);
  @apply shadow bg-white;
}
</style>
