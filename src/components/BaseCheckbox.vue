<template>
  <label class="checkbox-container">
    <slot></slot>
    <input
      type="checkbox"
      :checked="value"
      ref="input"
      class="checkmark-input"
      :class="isInvalid ? 'checkmark-input-invalid' : ''"
      :disabled="disabled"
      @input="update"
      @change="change"
      :required="required"
    />
    <span class="checkmark"></span>
  </label>
</template>
<script>
export default {
  name: 'BaseCheckbox',
  data() {
    return {
      isInvalid: false,
    };
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
  },
  methods: {
    update(e) {
      this.$emit('input', e.target.checked);
      this.isInvalid = !this.$refs.input.checkValidity();
    },
    change(e) {
      this.$emit('change', e.target.checked);
      this.isInvalid = !this.$refs.input.checkValidity();
    },
  },
};
</script>

<style scoped>
/* Customize the label (the container) */
.checkbox-container {
  display: block;
  position: relative;
  padding-left: 30px;
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
  top: 0;
  left: 0;
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
