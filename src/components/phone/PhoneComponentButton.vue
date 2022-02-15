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
      class="phone-component absolute w-84 -ml-84"
      :class="componentClass"
      v-show="showComponent"
    >
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
      this.showComponent = false;
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
  },
  methods: {
    toggleComponent() {
      const newState = !this.showComponent;
      EventBus.$emit('phone_component:close');
      this.showComponent = newState;
    },
  },
};
</script>

<style scoped>
.phone-component {
  margin-top: -3rem;
  @apply shadow bg-white;
}
</style>
