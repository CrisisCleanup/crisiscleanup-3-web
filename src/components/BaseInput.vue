<template>
  <div class="flex justify-start" :class="classes">
    <label v-if="topLabel" class="text-xs px-1 text-crisiscleanup-dark-300">{{
      topLabel
    }}</label>
    <component
      :is="textArea ? 'textarea' : 'input'"
      ref="input"
      :class="[inputClasses, defaultInputClasses, selector]"
      :data-cy="selector"
      :style="inputStyle"
      :type="type || 'search'"
      :value="value"
      :disabled="disabled || (breakGlass && !glassBroken)"
      :placeholder="placeholder"
      :required="required"
      :pattern="pattern"
      :autocomplete="autocomplete"
      :readonly="readonly"
      @input="update"
      @change="change"
      @blur="$emit('blur')"
    />
    <div
      v-if="breakGlass && !glassBroken"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
      @click="glassBroken = true"
    >
      <ccu-icon
        :alt="$t('actions.edit')"
        data-cy="js-break-glass"
        type="edit"
        size="small"
        class="js-break-glass"
      />
    </div>
    <div
      v-if="icon || tooltip"
      v-tooltip="{
        content: tooltip,
        trigger: 'hover',
        classes: 'interactive-tooltip w-72',
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
    <slot></slot>
  </div>
</template>

<script>
export default {
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
    iconSize: {
      type: String,
      default: 'small',
    },
    value: {
      type: null,
      default: null,
    },
    disabled: {
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
    validator: {
      type: [Function, Boolean],
      default: false,
    },
  },
  data() {
    return {
      id: null,
      isInvalid: false,
      iconClasses: {
        large: this.size === 'large',
        small: this.size === 'small',
        base: this.size !== 'large' && this.size !== 'small',
        'has-tooltip': Boolean(this.tooltip),
      },
      glassBroken: false,
    };
  },
  computed: {
    classes() {
      return {
        'border-crisiscleanup-red-100': this.topLabel && this.isInvalid,
        'flex-col items-start border': Boolean(this.topLabel),
        'items-center': !this.topLabel,
      };
    },
    defaultInputClasses() {
      return {
        'flex-grow': true,
        'p-1': true,
        'text-base': !this.inputClasses,
        xlarge: this.size === 'xlarge',
        large: this.size === 'large',
        medium: this.size === 'medium',
        small: this.size === 'small',
        base: !this.size,
        'has-icon': Boolean(this.icon),
        'has-tooltip': Boolean(this.tooltip),
        invalid: Boolean(this.isInvalid),
        'border-none': Boolean(this.topLabel),
      };
    },
  },
  mounted() {
    this.id = this._uid;
    this.$refs.input.addEventListener(
      'invalid',
      () => {
        this.isInvalid = true;
      },
      true,
    );
  },
  methods: {
    update(e) {
      const { value } = e.target;
      if (this.validator) {
        const { newValue, valid } = this.validator(value);
        this.isInvalid = valid;
        if (newValue) {
          this.$refs.input.value = newValue;
          return this.$emit('input', value);
        }
      }
      this.$emit('input', value);
      this.isInvalid = !this.$refs.input.checkValidity();
      return value;
    },
    change(e) {
      this.$emit('change', e.target.value);
      this.isInvalid = !this.$refs.input.checkValidity();
    },
  },
};
</script>

<style scoped>
input:disabled {
  background-color: #f7f7f7;
}

input::placeholder {
  @apply text-crisiscleanup-dark-200;
}

input.invalid {
  @apply border border-crisiscleanup-red-100;
}

input {
  outline: none;
  width: 300px;
  height: 40px;
  border-radius: 0;
  @apply border border-crisiscleanup-dark-100;
}

input.xlarge {
  height: 60px;
}

input.large {
  height: 50px;
}

input.medium {
  height: 40px;
}

input.small {
  height: 30px;
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
