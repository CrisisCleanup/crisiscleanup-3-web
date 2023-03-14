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
                    closeDialog('cancel');
                  }
                "
              />
            </div>
          </div>

          <div class="modal-body flex-grow p-3">
            <div>
              <div v-html="content"></div>
            </div>
          </div>

          <div class="modal-footer flex-shrink">
            <div class="flex items-center justify-center py-2 border-t">
              <div
                class="flex flex-col items-center justify-center"
                v-if="Object.keys(actions).length === 0"
              >
                <base-button
                  :alt="$t('actions.ok')"
                  variant="solid"
                  class="px-6 p-3"
                  :action="
                    () => {
                      closeDialog('ok');
                    }
                  "
                >
                  {{ $t("actions.ok") }}
                </base-button>
              </div>

              <div
                class="flex items-center justify-end w-full"
                v-if="Object.keys(actions).length > 0"
              >
                <base-button
                  v-for="(value, key) in actions"
                  :key="key"
                  :alt="value.text"
                  :variant="value.type"
                  class="px-6 p-3 mx-2"
                  :class="value.buttonClass"
                  :action="
                    () => {
                      closeDialog(key);
                    }
                  "
                >
                  {{ value.text }}
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
import { closeDialog } from 'vue3-promise-dialog'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MessageBox',
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    actions: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup () {
    return {
      closeDialog
    }
  }
})
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
