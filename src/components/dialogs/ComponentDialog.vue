<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div
          class="modal-container bg-white flex flex-col justify-between"
          :class="modalClasses"
          :style="modalStyle"
        >
          <div class="modal-header flex-shrink">
            <div
              v-if="title"
              class="title p-3 flex items-center justify-between border-b"
            >
              <span class="text-base font-bold">{{ title }}</span>
              <ccu-icon
                :alt="$t('actions.cancel')"
                data-testid="testCancelButton"
                size="xs"
                type="cancel"
                @click="
                  () => {
                    closeDialog('cancel');
                  }
                "
              />
            </div>
          </div>

          <div class="modal-body flex-grow">
            <div :class="modalBodyClasses">
              <component
                :is="dynamicComponent"
                v-bind="props"
                :class="classes"
                v-on="listeners"
              />
            </div>
          </div>

          <div v-if="!hideFooter" class="modal-footer flex-shrink">
            <div class="flex items-center justify-center py-2 border-t">
              <div class="flex flex-col items-center justify-center">
                <base-button
                  :alt="$t('actions.ok')"
                  data-testid="testOkButton"
                  variant="solid"
                  size="lg"
                  :action="
                    () => {
                      closeDialog('ok');
                    }
                  "
                >
                  {{ $t(actionText) || $t('actions.ok') }}
                </base-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { closeDialog } from 'vue3-promise-dialog';
import useEmitter from '../../hooks/useEmitter';

export default defineComponent({
  name: 'ComponentDialog',
  props: {
    id: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    component: {
      type: [Function],
      default() {},
    },
    classes: {
      type: String,
      default: '',
    },
    actionText: {
      type: String,
      default: '',
    },
    modalClasses: {
      type: null,
      default: 'max-w-lg',
    },
    modalBodyClasses: {
      type: null,
      default: null,
    },
    modalStyle: {
      type: null,
      default: null,
    },
    props: {
      type: Object,
      default() {
        return {};
      },
    },
    listeners: {
      type: Object,
      default() {
        return {};
      },
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { emitter } = useEmitter();

    emitter.on('modal_component:close', (key) => {
      if (key === props.id) {
        closeDialog('ok');
      }
    });

    const dynamicComponent = computed(() => {
      return props.component;
    });

    return {
      dynamicComponent,
      closeDialog,
    };
  },
});
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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

@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .modal-container {
    height: 95vh;
  }
  .modal-footer {
    @apply -mt-16;
  }
}
</style>
