<template>
  <label class="z-50">
    <input
      v-model="radioButtonValue"
      type="radio"
      :value="label"
      :name="name"
      :class="{ checked: type === 'boolean' ? value : label === value }"
    />
    <span>
      {{ name }}
    </span>
  </label>
</template>

<script>
export default {
  name: 'BaseRadio',
  props: {
    name: {
      type: String,
      default: '',
    },
    value: {
      type: null,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
  },
  computed: {
    radioButtonValue: {
      get() {
        return this.value;
      },
      set() {
        this.$emit('change', this.label);
      },
    },
  },
};
</script>

<style scoped>
[type='radio'].checked,
[type='radio']:not(.checked) {
  display: none;
}
[type='radio'].checked + span,
[type='radio']:not(.checked) + span {
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  line-height: 20px;
  display: inline-block;
  color: #666;
}
[type='radio'].checked + span:before,
[type='radio']:not(.checked) + span:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  border: 1px solid #353535;
  border-radius: 100%;
  background: #fff;
}
[type='radio'].checked + span:after,
[type='radio']:not(.checked) + span:after {
  content: '';
  width: 12px;
  height: 12px;
  background: #353535;
  position: absolute;
  top: 3px;
  left: 3px;
  border-radius: 100%;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}
[type='radio']:not(.checked) + span:after {
  opacity: 0;
  -webkit-transform: scale(0);
  transform: scale(0);
}
[type='radio'].checked + span:after {
  opacity: 1;
  -webkit-transform: scale(1);
  transform: scale(1);
}
</style>
