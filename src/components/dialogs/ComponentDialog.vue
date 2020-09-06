<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container bg-white flex flex-col justify-between">
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
            <div>
              <component
                :is="dynamicComponent"
                v-bind="props"
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
export default {
  name: 'ComponentDialog',
  computed: {
    dynamicComponent() {
      if (typeof this.component === 'string') {
        return () => import(`@/components/${this.component}`);
      }
      return this.component;
    },
  },
  props: {
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
    props: {
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
  @apply max-w-lg;
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
</style>
