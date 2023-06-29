<template>
  <div class="phone-system-action">
    <div
      class="phone-system-action__button"
      data-testid="testPhoneSystemActionButtonDiv"
      :class="showComponent ? 'phone-system-action__button--active' : ''"
      @click="toggleComponent"
    >
      <slot name="button">
        <div class="phone-system-action__icon">
          <ccu-icon
            v-if="icon"
            data-testid="testPhoneSystemActionIcon"
            :alt="$t('phoneDashboard.call_this_person')"
            :type="icon"
            :class="iconClass"
            :size="iconSize"
          />
        </div>
      </slot>
    </div>

    <template v-if="mq.smMinus">
      <modal v-show="showComponent" @close="() => (showComponent = false)">
        <slot name="component"></slot>
      </modal>
    </template>

    <template v-else>
      <div
        v-show="showComponent"
        data-testid="testPhoneSystemActionContentDiv"
        class="phone-system-action__content"
        :class="componentClass"
        :style="componentStyle"
      >
        <div class="phone-system-action__close">
          <ccu-icon
            :alt="$t('actions.cancel')"
            data-testid="testPhoneSystemActionCloseIcon"
            size="xs"
            type="cancel"
            class="phone-system-action__close-icon"
            @click="() => (showComponent = false)"
          />
        </div>
        <slot name="component"></slot>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { useMq } from 'vue3-mq';
import useEmitter from '../../hooks/useEmitter';
import Modal from '@/components/Modal.vue';

export default defineComponent({
  name: 'PhoneComponentButton',
  components: { Modal },
  props: {
    name: { type: String, default: null, required: true },
    icon: { type: String, default: null, required: false },
    iconClass: { type: String, default: null, required: false },
    componentClass: { type: String, default: null, required: false },
    componentStyle: { type: String, default: null, required: false },
    iconSize: { type: String, default: null, required: false },
    keepOpen: { type: Boolean, default: false, required: false },
  },
  setup(props, { emit }) {
    const showComponent = ref(false);
    const top = ref(0);
    const { emitter } = useEmitter();
    const mq = useMq();

    function toggleComponent() {
      if (props.keepOpen) {
        showComponent.value = true;
      } else {
        const newState = !showComponent.value;
        emitter.emit('phone_component:close');
        showComponent.value = newState;
      }
    }

    onBeforeMount(() => {
      emitter.on('phone_component:close', () => {
        showComponent.value = props.keepOpen;
      });
      emitter.on('phone_component:open', (name) => {
        if (props.name === name) {
          emitter.emit('phone_component:close');
          showComponent.value = true;
        }
      });
    });

    watch(
      () => showComponent.value,
      (newValue, oldValue) => {
        if (newValue && !oldValue) {
          emit('open');
          // TODO: Fix scrolling
          // const el = this.$parent.$refs.phoneButtons;
          // const rect = el.getBoundingClientRect();
          // this.top = `${parseInt(rect.top + window.scrollY)}px`;
        }
      },
    );

    return {
      top,
      showComponent,
      toggleComponent,
      mq,
    };
  },
});
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
