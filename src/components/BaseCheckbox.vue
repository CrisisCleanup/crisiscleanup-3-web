<template>
  <label class="checkbox-container">
    <slot></slot>
    <input
      type="checkbox"
      :checked="value"
      class="checkmark-input"
      @input="$emit('input', $event.target.checked)"
      @change="$emit('change', $event.target.checked)"
    />
    <span class="checkmark"></span>
  </label>
</template>
<script>
export default {
  name: 'BaseCheckbox',
  props: ['value'],
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
.checkbox-container input:checked ~ .checkmark {
  background-color: #000000;
}

.checkbox-container input:disabled ~ .checkmark {
  background-color: #e4e5e7;
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
