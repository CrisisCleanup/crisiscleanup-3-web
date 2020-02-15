<template>
  <div class="flex items-center justify-start">
    <input
      ref="input"
      :class="classes"
      :style="inputStyle"
      :type="type || 'search'"
      :value="value"
      :disabled="disabled || (breakGlass && !glassBroken)"
      :placeholder="placeholder"
      :required="required"
      autocomplete="off"
      @input="update"
      @change="change"
    />
    <div
      v-if="breakGlass && !glassBroken"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
      @click="glassBroken = true"
    >
      <ccu-icon type="edit" size="small" />
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
      <ccu-icon :type="tooltip ? 'info' : icon" size="small" />
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
    required: {
      type: Boolean,
      default: false,
    },
    tooltip: {
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
    breakGlass: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      id: null,
      classes: {
        'flex-grow': true,
        'text-base': true,
        large: this.size === 'large',
        base: this.size !== 'large',
        'has-icon': Boolean(this.icon),
        'has-tooltip': Boolean(this.tooltip),
      },
      iconClasses: {
        large: this.size === 'large',
        base: this.size !== 'large',
        'has-tooltip': Boolean(this.tooltip),
      },
      glassBroken: false,
    };
  },
  mounted() {
    this.id = this._uid;
  },
  methods: {
    update(e) {
      this.$emit('input', e.target.value);
    },
    change(e) {
      this.$emit('change', e.target.value);
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

input:invalid {
  @apply border border-crisiscleanup-red-100;
}

input {
  outline: none;
  width: 300px;
  height: 40px;
  border-radius: 0;
  @apply border border-crisiscleanup-dark-100;
  padding: 10px;
}

input.large {
  height: 50px;
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

.icon-container.has-tooltip {
  background-color: #f7f7f7;
}
</style>
