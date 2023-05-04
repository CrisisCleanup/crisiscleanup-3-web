<template>
  <div class="select__container">
    <resize-observer @notify="handleResize" />
    <v-select
      :input-id="inputIdSelector"
      :value="modelValue"
      :options="options"
      :label="label"
      :components="{ OpenIndicator, Deselect }"
      :searchable="searchable"
      :multiple="multiple"
      :clearable="clearable"
      :disabled="disabled"
      class="form-select text-base"
      :class="[
        selectClasses,
        isInvalid && !modelValue ? 'invalid' : '',
        floatLabel ? 'py-2 pt-3' : '',
      ]"
      :placeholder="placeholder"
      :reduce="(item) => (itemKey ? item[itemKey] : item)"
      :selectable="
        () =>
          !multiple ||
          !limit ||
          (multiple && limit > 0 && modelValue.length < limit)
      "
      v-bind="$attrs"
      @input="onInput"
      @search:focus="open"
      @search:blur="onBlur"
      @search="(payload) => $emit('search', payload)"
    >
      <template #selected-option="option">
        <slot name="selected-option" :option="option" />
      </template>
      <template #option="option">
        <slot name="option" :option="option" />
      </template>
      <template #list-header>
        <slot name="list-header" />
      </template>
      <template v-if="required" #search="{ attributes, events }">
        <input
          ref="input"
          class="vs__search"
          :required="!modelValue"
          :readonly="false"
          v-bind="attributes"
          :placeholder="placeholder"
          v-on="events"
        />
      </template>
    </v-select>
    <label
      v-if="floatLabel"
      ref="inputLabel"
      :style="isFloated && floatStyle"
      for="select-id"
    >
      <slot name="float-label" v-bind="{ isFloated }">
        {{ floatLabel }}
      </slot>
    </label>
  </div>
</template>

<script lang="jsx">
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref, nextTick, defineComponent, h } from 'vue';
import { kebabCase, isEmpty as empty, xor } from 'lodash';

/**
 * @deprecated Use `BaseSelect` instead
 */
export default defineComponent({
  name: 'FormSelect',
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
    options: {
      type: Array,
      default() {
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
    const baseHeight_ = ref(0);
    const currentHeight_ = ref(0);
    const floatDisplacement = ref(0);
    const Deselect = {
      render() {
        return (
          <ccu-icon
            alt={cancelText}
            size={iconSize}
            class="mx-1 opacity-50"
            type="cancel"
          />
        );
      },
    };
    const OpenIndicator = {
      render: () =>
        h('i', {
          class: `fa fa-${indicatorIcon}`,
        }),
    };

    const inputIdSelector = computed(() => {
      const idSpec = props.floatLabel ? props.floatLabel : '';
      return `select-id-${kebabCase(idSpec)}`;
    });

    const inputRef = computed(() => {
      return input.value || document.getElementById(inputIdSelector.value);
    });

    const heightMultiplier = computed(() => {
      if (currentHeight_.value === 0) return 1;
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

      if (props.required && input.value.checkValidity()) {
        isInvalid.value = false;
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
        const items = Array.prototype.slice.call(
          document.querySelectorAll('.vs__dropdown-option'),
        );

        for (const item of items) {
          item.classList.remove('vs__dropdown-option--highlight');
        }

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
      isInvalid,
      floatDisplacement,
      cancelText,
      Deselect,
      OpenIndicator,
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
});
</script>

<style>
.form-select .vs__dropdown-menu {
  border-radius: 0;
}
.form-select .vs__dropdown-toggle {
  height: 100%;
  border-radius: 0;
  border: none;
  .vs__selected-options.has-float {
    margin-top: 5px;
    margin-bottom: -5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.form-select .vs__search::placeholder {
  @apply text-crisiscleanup-dark-200;
}

.form-select {
  &.vs--single .has-float {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    span {
      @apply font-bold;
    }
  }
}

.form-select.invalid {
  @apply border border-crisiscleanup-red-100;
}

.vue-select-up.form-select .vs__dropdown-menu {
  top: auto !important;
  bottom: calc(100% - 3px);
}

.vs__dropdown-option--highlight {
  @apply bg-gray-300;
}
</style>

<style lang="postcss">
.select {
  &__container {
    position: relative;
    > label {
      @apply text-h2 font-normal text-crisiscleanup-dark-400;
      position: absolute;
      top: 25%;
      bottom: 0;
      left: 1%;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transition: transform 200ms easeInOutQuint, color 150ms easeInOutQuint,
        font-size 150ms easeInOutQuint;
      &.focused {
        @apply text-h4 font-normal text-crisiscleanup-dark-300;
      }
    }
  }
}
</style>
