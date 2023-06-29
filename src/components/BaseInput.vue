<template>
  <div class="flex justify-start relative" :class="classes">
    <label v-if="topLabel" class="text-xs px-1 text-crisiscleanup-dark-300">{{
      topLabel
    }}</label>
    <component
      :is="textArea ? 'textarea' : 'input'"
      ref="input"
      :class="[inputClasses, defaultInputClasses, selector]"
      :style="[cssVars, inputStyle]"
      :type="passwordView || type || 'search'"
      :value.prop="modelValue"
      :disabled="disabled || (breakGlass && !glassBroken)"
      :placeholder="placeholder"
      :required="required"
      :hidden="hidden"
      :pattern="pattern"
      :autocomplete="autocomplete"
      :rows="rows"
      @input="update"
      @input.stop=""
      @change="change"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      @keyup.enter="$emit('enter')"
      @invalid="isInvalid = true"
    />
    <div
      v-if="breakGlass && !glassBroken && !hidden"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
      @click="glassBroken = true"
    >
      <ccu-icon
        :alt="$t('actions.edit')"
        data-testid="testBreakGlassButton"
        type="edit"
        size="small"
        class="js-break-glass"
      />
    </div>
    <div
      v-if="faIcon"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
    >
      <ccu-icon
        :fa="true"
        size="medium"
        :type="faIcon"
        :alt="tooltip"
        :action="
          () => {
            $emit('iconClicked');
          }
        "
      />
    </div>
    <div
      v-else-if="icon || tooltip"
      v-tooltip="{
        content: tooltip,
        triggers: ['hover'],
        popperClass: 'interactive-tooltip w-72',
        html: true,
      }"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
    >
      <ccu-icon
        :alt="$t('actions.help_alt')"
        :type="tooltip ? 'info' : icon"
        :size="iconSize"
      />
    </div>
    <font-awesome-icon
      v-if="type === 'password'"
      :alt="$t('actions.help_alt')"
      size="lg"
      class="cursor-pointer absolute right-0 mr-4"
      :icon="passwordView === 'text' ? 'eye-slash' : 'eye'"
      @click="
        () => {
          if (passwordView === 'text') {
            passwordView = 'password';
          } else {
            passwordView = 'text';
          }
        }
      "
    />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseInput',
  props: {
    size: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    faIcon: {
      type: String,
      default: '',
    },
    iconSize: {
      type: String,
      default: 'small',
    },
    modelValue: {
      type: null,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    pattern: {
      type: String,
      default: '.*',
    },
    required: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: String,
      default: '',
    },
    topLabel: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    inputStyle: {
      type: String,
      default: '',
    },
    inputClasses: {
      type: String,
      default: '',
    },
    breakGlass: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    selector: {
      type: String,
      default: '',
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    textArea: {
      type: Boolean,
      default: false,
    },
    rows: {
      type: Number,
      default: 0,
    },
    validator: {
      type: [Function, Boolean],
      default: false,
    },
    width: {
      type: String,
      default: '300',
    },
    height: {
      type: String,
      default: '40',
    },
  },
  emits: ['update:modelValue'],

  setup(props, context) {
    const id = ref(null);
    const isInvalid = ref(false);
    const input = ref(null);
    const passwordView = ref(props.type === 'password' ? 'password' : '');
    const iconClasses = ref({
      large: props.size === 'large',
      small: props.size === 'small',
      base: props.size !== 'large' && props.size !== 'small',
      'has-tooltip': Boolean(props.tooltip),
    });
    const glassBroken = ref(false);

    const cssVars = computed(() => {
      return {
        '--height': `${props.height}px`,
        '--width': `${props.width}px`,
      };
    });

    const classes = computed(() => ({
      'border-crisiscleanup-red-100': props.topLabel && isInvalid.value,
      'flex-col items-start border': Boolean(props.topLabel),
      'items-center': !props.topLabel,
    }));

    const defaultInputClasses = computed(() => ({
      'flex-grow': true,
      'p-1': true,
      'text-base': !props.inputClasses,
      xlarge: props.size === 'xlarge',
      large: props.size === 'large',
      medium: props.size === 'medium',
      small: props.size === 'small',
      base: props.size === 0,
      'has-icon': Boolean(props.icon),
      'has-tooltip': Boolean(props.tooltip),
      invalid: Boolean(isInvalid.value),
      'border-none': Boolean(props.topLabel),
    }));

    function update(e) {
      const { value } = e.target;
      if (props.validator) {
        const { newValue, valid } = props.validator(value);
        isInvalid.value = valid;
        if (newValue) {
          input.value = newValue;
          return context.emit('update:modelValue', newValue);
        }
      }

      context.emit('update:modelValue', value);
      isInvalid.value = !input?.value?.checkValidity();
      return value;
    }

    function change(e) {
      context.emit('change', e.target.value);
      isInvalid.value = !input?.value?.checkValidity();
    }

    return {
      input,
      id,
      isInvalid,
      passwordView,
      iconClasses,
      glassBroken,
      classes,
      cssVars,
      defaultInputClasses,
      update,
      change,
    };
  },
});
</script>

<style scoped>
input:disabled {
  background-color: #f7f7f7;
}

textarea:disabled {
  background-color: #f7f7f7;
}

input::placeholder {
  @apply text-crisiscleanup-dark-200;
}

textarea::placeholder {
  @apply text-crisiscleanup-dark-200;
}

input.invalid {
  @apply border border-crisiscleanup-red-100;
}

textarea.invalid {
  @apply border border-crisiscleanup-red-100;
}

input {
  outline: none;
  width: var(--width);
  height: var(--height);
  border-radius: 0;
  @apply border border-crisiscleanup-dark-100;
  -webkit-appearance: none;
  opacity: 1;
}

textarea {
  outline: none;
  @apply border border-crisiscleanup-dark-100;
  border-radius: 0;
}

input:not([type='radio']):not([type='checkbox']) {
  -webkit-appearance: none;
  border-radius: 0;
}

input.xlarge {
  height: 60px;
}

input.large {
  height: 50px;
}

input.medium {
  height: 40px;
  width: 225px;
}

input.small {
  height: 32px;
  width: 150px;
}

textarea.large {
  height: 150px;
}

.icon-container {
  width: 40px;
  height: 40px;
  @apply border border-crisiscleanup-dark-100;
  border-left: 0;
}

.icon-container.large {
  width: 50px;
  height: 50px;
}

.icon-container.small {
  height: 30px;
}

.icon-container.has-tooltip {
  background-color: #f7f7f7;
}
</style>
