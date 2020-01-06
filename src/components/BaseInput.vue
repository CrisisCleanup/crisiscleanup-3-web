<template>
  <div class="flex items-center justify-start">
    <input
      ref="input"
      :class="classes"
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
      <ccu-icon type="edit" size="small"></ccu-icon>
    </div>
    <div
      v-if="icon || tooltip"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
    >
      <ccu-icon :type="tooltip ? 'info' : icon" size="small"></ccu-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    size: String,
    icon: String,
    value: {
      type: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
    required: {
      type: Boolean,
      default: false,
    },
    tooltip: String,
    type: String,
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

input {
  outline: none;
  width: 300px;
  height: 40px;
  border-radius: 0;
  border: solid 1px #dadada;
  padding: 10px;
}

input.large {
  height: 50px;
}

.icon-container {
  width: 40px;
  height: 40px;
  border: solid 1px #dadada;
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
