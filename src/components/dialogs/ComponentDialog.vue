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
                size="xs"
                type="cancel"
                @click.native="
                  () => {
                    $close('cancel');
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
                v-on="listeners"
                :class="classes"
              />
            </div>
          </div>

          <div class="modal-footer flex-shrink">
            <div class="flex items-center justify-center py-2 border-t">
              <div class="flex flex-col items-center justify-center">
                <base-button
                  :alt="$t('actions.ok')"
                  variant="solid"
                  size="lg"
                  :action="
                    () => {
                      $close('ok');
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

<script>
import { EventBus } from '@/event-bus';

export default {
  name: 'ComponentDialog',
  created() {
    EventBus.$on('modal_component:close', (key) => {
      if (key === this.id) {
        this.$close();
      }
    });
  },
  computed: {
    dynamicComponent() {
      if (typeof this.component === 'string') {
        return () => import(`@/components/${this.component}`);
      }
      return this.component;
    },
  },
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
      type: [String, Function],
      default: '',
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
      default: () => {
        return {};
      },
    },
    listeners: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
};
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
