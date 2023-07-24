<template>
  <transition name="modal" class="absolute">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div
          class="modal-container bg-white flex flex-col justify-between"
          :class="
            modalClasses + (isFullScreen ? ' modal-container--fullscreen' : '')
          "
          :style="modalStyle"
        >
          <div class="modal-header flex-shrink" :class="modalHeaderClasses">
            <slot name="header">
              <div
                v-if="title"
                class="title p-3 flex items-center justify-between border-b"
              >
                <span class="text-base font-bold">{{ title }}</span>
                <div class="flex gap-2 items-center">
                  <ccu-icon
                    v-if="allowFullScreen"
                    :alt="$t('actions.fullscreen')"
                    data-testid="testModalFullScreenIcon"
                    size="xs"
                    :type="fullScreenIcon"
                    fa
                    @click="toggleFullScreen"
                  />
                  <ccu-icon
                    :alt="$t('actions.cancel')"
                    data-testid="testModalCancelIcon"
                    size="xs"
                    type="cancel"
                    @click="
                      () => {
                        $emit('close');
                        $emit('cancel');
                      }
                    "
                  />
                </div>
              </div>
            </slot>
          </div>

          <div class="modal-body">
            <ccu-icon
              v-if="closeable && !title"
              data-testid="testModalCancel2Icon"
              :alt="$t('actions.cancel')"
              size="xs"
              type="cancel"
              class="absolute right-0 p-2"
              @click="
                () => {
                  $emit('close');
                  $emit('cancel');
                }
              "
            />
            <div :class="modalBodyClasses">
              <slot></slot>
            </div>
          </div>

          <div class="modal-footer flex-shrink bg-white">
            <slot name="footer">
              <div class="flex items-center justify-center py-2 border-t">
                <base-button
                  :alt="$t('actions.ok')"
                  data-testid="testModalOkButton"
                  variant="solid"
                  class="px-6 p-3"
                  :action="
                    () => {
                      $emit('ok');
                      $emit('close');
                    }
                  "
                >
                  {{ $t('actions.ok') }}
                </base-button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Modal',
  props: {
    modalClasses: {
      type: null,
      default: null,
    },
    modalHeaderClasses: {
      type: null,
      default: null,
    },
    modalBodyClasses: {
      type: null,
      default: null,
    },
    modalStyle: {
      type: null,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
    closeable: {
      type: Boolean,
      default: false,
    },
    allowFullScreen: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['ok', 'close', 'cancel'],
  setup(props) {
    const isFullScreen = ref(props.fullscreen);
    const fullScreenIcon = computed(() =>
      isFullScreen.value
        ? 'down-left-and-up-right-to-center'
        : 'up-right-and-down-left-from-center',
    );
    function toggleFullScreen() {
      if (props.allowFullScreen) {
        isFullScreen.value = !isFullScreen.value;
      }
    }

    return {
      isFullScreen,
      fullScreenIcon,
      toggleFullScreen,
    };
  },
});
</script>

<style lang="postcss" scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  margin: 0 auto;
  transition: all 0.3s ease;

  &--fullscreen {
    max-width: 100%;
    width: 100%;
    height: 100%;
  }
}

.modal-default-button {
  float: right;
}

/*
     * The following styles are auto-applied to elements with
     * transition="modal" when their visibility is toggled
     * by Vue.js.
     *
     * You can easily play with the modal transition by editing
     * these styles.
     */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.modal-body {
  @apply flex-grow;
}

@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .modal-container {
    height: 95vh;
  }
  .modal-footer {
    @apply -mt-16;
  }
  .modal-body {
    @apply h-full;
  }
}
</style>
