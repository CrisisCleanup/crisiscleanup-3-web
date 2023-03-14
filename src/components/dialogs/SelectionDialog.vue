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
                @click="
                  () => {
                    closeDialog(false);
                  }
                "
              />
            </div>
          </div>

          <div class="modal-body flex-grow p-3">
            <div>
              {{ content }}
            </div>
            <div>
              <base-select
                :placeholder="placeholder"
                class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-full"
                :options="options"
                v-model="response"
                :label="label"
                :item-key="itemKey"
              ></base-select>
            </div>
          </div>

          <div class="modal-footer flex-shrink">
            <div class="flex items-center justify-center py-2 border-t">
              <base-button
                :alt="$t('actions.ok')"
                variant="solid"
                class="px-4 p-2 mx-2"
                :action="
                  () => {
                    closeDialog(response);
                  }
                "
              >
                {{ $t('actions.ok') }}
              </base-button>
              <base-button
                :alt="$t('actions.cancel')"
                class="px-4 p-2 border border-black mx-2"
                :action="
                  () => {
                    closeDialog(false);
                  }
                "
              >
                {{ $t('actions.cancel') }}
              </base-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { closeDialog } from 'vue3-promise-dialog';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'SelectionDialog',
  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: null,
    },
    itemKey: {
      type: String,
      default: null,
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  setup() {
    const response = ref('');
    return {
      response,
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
