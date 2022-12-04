<template>
  <div>
    <Multiselect
      :value="modelValue"
      @input="
        (v) => {
          onInput(v);
          $emit('update:modelValue', v);
        }
      "
      :options="options"
      :can-clear="clearable"
      :searchable="searchable"
      :label="label"
      :value-prop="itemKey"
      :limit="limit"
      :mode="multiple ? 'multiple' : 'single'"
      :disabled="disabled"
      class="form-select text-base"
      :class="[
        isInvalid && !modelValue ? 'invalid' : '',
        floatLabel ? 'py-2 pt-3' : '',
      ]"
      :placeholder="placeholder"
      :classes="{
        search: selectClasses,
        container: containerClasses,
      }"
    >
      <template #singlelabel="{ value }">
        <slot name="selected-option" :option="value" />
      </template>

      <template #option="{ option }">
        <slot name="option" :option="option" />
      </template>

      <template #beforelist>
        <slot name="list-header" />
      </template>
    </Multiselect>
    <label
      :style="isFloated && floatStyle"
      v-if="floatLabel"
      ref="inputLabel"
      for="select-id"
    >
      <slot name="float-label" v-bind="{ isFloated }">
        {{ floatLabel }}
      </slot>
    </label>
  </div>
</template>

<script>
import Multiselect from '@vueform/multiselect';
import { computed, h, nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isEmpty as empty, kebabCase, xor } from 'lodash';

export default {
  name: 'BaseSelect',
  components: {
    Multiselect,
  },
  props: {
    searchable: {
      type: Boolean,
      default: false,
    },
    multiple: {
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
    clearable: {
      type: Boolean,
      default: true,
    },
    selectClasses: {
      type: String,
      default: '',
    },
    containerClasses: {
      type: String,
      default:
        'border relative mx-auto w-full flex items-center justify-end cursor-pointer bg-white text-base leading-snug outline-none',
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    limit: {
      type: Number,
      default: 0,
    },
    placeholder: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'large',
    },
    modelValue: {
      type: null,
      default: null,
    },
    itemKey: {
      type: null,
      default: null,
    },
    indicatorIcon: {
      type: String,
      default: 'sort',
    },
    floatLabel: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const cancelText = t('actions.cancel');

    const iconSize = props.multiple ? 'xxs' : 'medium';
    const { indicatorIcon } = props;
    const input = ref(null);
    const inputLabel = ref(null);
    const isFloated_ = ref(false);
    const isEmpty_ = ref(false);
    const isInvalid = ref(false);
    const baseHeight_ = ref(0.0);
    const currentHeight_ = ref(0.0);
    const floatDisplacement = ref(0.0);
    const selected = ref(null);

    const inputIdSelector = computed(() => {
      const idSpec = props.floatLabel ? props.floatLabel : '';
      return `select-id-${kebabCase(idSpec)}`;
    });

    const inputRef = computed(() => {
      return input.value || document.getElementById(inputIdSelector.value);
    });

    const heightMultiplier = computed(() => {
      if (currentHeight_.value === 0.0) return 1;
      return currentHeight_.value / baseHeight_.value;
    });

    const floatStyle = computed(() => {
      const displace = heightMultiplier.value * -12;
      return { transform: `translateY(${displace}px)` };
    });

    const isEmpty = computed(() => {
      if (props.modelValue !== null) {
        return empty(props.modelValue);
      }
      return isEmpty_.value;
    });

    const isFloated = computed(() => {
      if (isFloated_.value === true) {
        return true;
      }
      if (isEmpty.value === false) {
        return true;
      }
      return isFloated_.value;
    });

    function onInput(value) {
      isEmpty_.value = value === null;
      if (value === null && props.floatLabel) {
        isFloated_.value = false;
        inputLabel.value.classList.remove('focused');
      }
      if (props.multiple) {
        const current = props.modelValue || [];
        emit(
          'changed',
          xor(
            value,
            current.map((item) => (props.itemKey ? item[props.itemKey] : item)),
          ),
        );
      }
      if (props.required) {
        if (input.value.checkValidity()) {
          isInvalid.value = false;
        }
      }
    }

    function onBlur() {
      if (props.floatLabel && isEmpty.value) {
        isFloated_.value = false;
        inputLabel.value.classList.remove('focused');
      }
    }

    function open() {
      if (props.floatLabel) {
        isFloated_.value = true;
        inputLabel.value.classList.add('focused');
      }
      nextTick(() => {
        const items = [].slice.call(
          document.querySelectorAll('.vs__dropdown-option'),
        );

        items.forEach((item) => {
          item.classList.remove('vs__dropdown-option--highlight');
        });

        const selected = items.find((item) => {
          if (props.modelValue) {
            const currentLabel = props.label
              ? props.modelValue[props.label]
              : props.modelValue;
            return item.textContent.trim() === currentLabel;
          }
          return false;
        });

        if (selected) {
          selected.classList.add('vs__dropdown-option--highlight');
          document.querySelector('.vs__dropdown-menu').scrollTop =
            selected.offsetTop;
        }
      });
    }
    function handleResize() {
      currentHeight_.value = inputRef.value.parentElement.clientHeight;
      emit('resize', currentHeight_.value);
    }

    onMounted(() => {
      if (props.required) {
        input.value.addEventListener(
          'invalid',
          () => {
            isInvalid.value = true;
          },
          true,
        );
      }
      if (props.floatLabel) {
        inputRef.value.parentElement.classList.add('has-float');
        baseHeight_.value = inputRef.value.parentElement.clientHeight;
      }
    });

    return {
      selected,
      // options,
      isInvalid,
      floatDisplacement,
      cancelText,
      inputIdSelector,
      inputRef,
      heightMultiplier,
      floatStyle,
      isEmpty,
      isFloated,
      onInput,
      onBlur,
      open,
      handleResize,
      input,
      inputLabel,
    };
  },
};
</script>

<style src="@vueform/multiselect/themes/tailwind.css"></style>
