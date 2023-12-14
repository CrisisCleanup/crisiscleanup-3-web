<template>
  <div class="border-b border-gray-200">
    <button
      class="w-full text-left bg-white py-2 px-4 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
      @click="toggleOpen"
    >
      {{ name }}
      <font-awesome-icon :icon="isOpen ? 'chevron-down' : 'chevron-right'" />
    </button>
    <div v-show="isOpen" class="py-2 px-4">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs } from 'vue';

export default {
  name: 'AccordionItem',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      isOpen: false,
    });

    const toggleOpen = () => {
      state.isOpen = !state.isOpen;
    };

    return {
      ...toRefs(state),
      toggleOpen,
    };
  },
};
</script>
