<template>
  <label class="checkbox-container" :style="containerStyle">
    <slot></slot>
    <input
      type="checkbox"
      :checked="value"
      ref="input"
      class="checkmark-input"
      :class="isInvalid ? 'checkmark-input-invalid' : ''"
      :disabled="disabled"
      @update:modelValue="update"
      @change="change"
      :required="required"
    />
    <span class="checkmark" :style="checkmarkStyle"></span>
  </label>
</template>
<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';
// import { EventsMixin } from '@/mixins';
// import useLogEvent from '@/use/events/useLogEvent';

export default defineComponent({
  name: 'BaseCheckbox',
  // mixins: [EventsMixin],

  setup(props, context) {
    // const { logEvent } = useLogEvent();

    const isInvalid = ref(false);
    const input = ref<HTMLInputElement | null>(null);

    onMounted(async () => {
      input?.value?.addEventListener(
        'invalid',
        () => {
          isInvalid.value = true;
        },
        true,
      );
    });

    function update(e) {
      context.emit('input', e.target.checked);
      isInvalid.value = input?.value?.checkValidity() || false;
      // logEvent(props.ccuEvent);
    }

    function change(e) {
      context.emit('change', e.target.checked);
      isInvalid.value = input?.value?.checkValidity() || false;
    }

    return {
      isInvalid,
      update,
      change,
    };
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    ccuEvent: {
      type: String,
      default: '',
    },
    checkmarkStyle: {
      type: String,
      default: 'top: 0;left: 0;',
    },
    containerStyle: {
      type: String,
      default: 'display: block; padding-left: 30px;',
    },
  },
});
</script>

<style scoped>
/* Customize the label (the container) */
.checkbox-container {
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  height: 20px;
  width: 20px;
  border: solid 1px #c8cacf;
  background-color: white;
}

/* When the checkbox is checked, add a blue background */
.checkbox-container .checkmark-input:checked ~ .checkmark {
  background-color: #000000;
}

.checkbox-container .checkmark-input:disabled ~ .checkmark {
  background-color: #e4e5e7;
}

.checkbox-container .checkmark-input-invalid ~ .checkmark {
  @apply border-crisiscleanup-red-100;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
