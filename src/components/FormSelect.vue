<template>
  <div class="select__container">
    <resize-observer @notify="handleResize" />
    <v-select
      :input-id="inputIdSelector"
      :value="value"
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
        isInvalid && !value ? 'invalid' : '',
        floatLabel ? 'py-2 pt-3' : '',
      ]"
      :placeholder="placeholder"
      :reduce="(item) => (itemKey ? item[itemKey] : item)"
      :selectable="
        () =>
          !multiple || !limit || (multiple && limit > 0 && value.length < limit)
      "
      @input="onInput"
      @search:focus="open"
      @search:blur="onBlur"
      @search="(payload) => $emit('search', payload)"
      v-bind="$attrs"
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
          :required="!value"
          :readonly="false"
          v-bind="attributes"
          v-on="events"
          :placeholder="placeholder"
        />
      </template>
    </v-select>
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

<script lang="ts">
import { xor, kebabCase, isEmpty } from 'lodash';
import {
  ref,
  defineComponent,
  onMounted,
  computed,
  nextTick,
  h,
} from '@vue/composition-api';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import usei18n from '@/use/usei18n';
import useLog from '@/use/useLog';
import BaseIcon from '@/components/BaseIcon.vue';

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
    value: {
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
  setup(props, context) {
    const { $t } = usei18n();
    const { $log } = useLog();

    const iconSize = props.multiple ? 'xxs' : 'medium';
    const { indicatorIcon } = props;
    const cancelText = $t('actions.cancel');
    const input = ref<HTMLInputElement | null>(null);
    const inputLabel = ref<HTMLLabelElement | null>(null);

    const isFloated_ = ref(false);
    const isEmpty_ = ref(true);
    const isInvalid = ref(false);
    const baseHeight_ = ref(0.0);
    const currentHeight_ = ref(0.0);
    const floatDisplacement = ref(0);

    const Deselect = {
      setup: () => {
        return () => {
          return h(BaseIcon, {
            attrs: {
              alt: cancelText,
              size: iconSize,
              type: 'cancel',
              class: 'mx-1 opacity-50',
            },
          } as any);
        };
      },
    };

    const OpenIndicator = {
      setup: () => {
        return () => {
          return h(FontAwesomeIcon, {
            attrs: {
              icon: indicatorIcon,
              size: 'sm',
              class: 'mx-1 text-crisiscleanup-dark-400',
            },
          } as any);
        };
      },
    };

    const inputIdSelector = computed(() => {
      const idSpec = props.floatLabel ? props.floatLabel : '';
      return `select-id-${kebabCase(idSpec)}`;
    });

    const inputRef = computed(() => {
      if (input.value) return input.value;
      return document.getElementById(inputIdSelector.value);
    });

    const heightMultiplier = computed(() => {
      if (currentHeight_.value === 0.0) return 1;
      $log.debug('current container height:', currentHeight_.value);
      const multi = currentHeight_.value / baseHeight_.value;
      $log.debug('height multiplier change: ', multi);
      return multi;
    });

    const floatStyle = computed(() => {
      const displace = heightMultiplier.value * -12;
      return { transform: `translateY(${displace}px)` };
    });

    const empty = computed(() => {
      if (props.value !== null) {
        return isEmpty(props.value);
      }
      return isEmpty_.value;
    });

    const isFloated = computed(() => {
      if (isFloated_.value === true) {
        return true;
      }
      if (!empty.value) {
        return true;
      }
      return isFloated_.value;
    });

    onMounted(async () => {
      // this.id = this._uid;
      if (props.required && input) {
        input.value?.addEventListener(
          'invalid',
          () => {
            isInvalid.value = true;
          },
          true,
        );
      }
      if (props.floatLabel) {
        inputRef.value?.parentElement?.classList.add('has-float');
        baseHeight_.value = inputRef.value?.parentElement?.clientHeight || 0;
      }
    });

    function onInput(value) {
      context.emit('input', value);
      isEmpty_.value = value === null;
      if (value === null && props.floatLabel) {
        isFloated_.value = false;
        inputLabel.value?.classList.remove('focused');
      }
      if (props.multiple) {
        const current = props.value || [];
        context.emit(
          'changed',
          xor(
            value,
            current.map((item) => (props.itemKey ? item[props.itemKey] : item)),
          ),
        );
      }
      if (props.required) {
        if (input.value?.checkValidity()) {
          isInvalid.value = false;
        }
      }
    }
    function onBlur() {
      if (props.floatLabel && empty.value) {
        isFloated_.value = false;
        inputLabel.value?.classList.remove('focused');
      }
    }
    function open() {
      if (props.floatLabel) {
        isFloated_.value = true;
        inputLabel.value?.classList.add('focused');
      }
      nextTick(() => {
        const items: HTMLElement[] = [].slice.call(
          document.querySelectorAll('.vs__dropdown-option'),
        );

        items.forEach((item) => {
          item.classList.remove('vs__dropdown-option--highlight');
        });

        const selected = items.find((item) => {
          if (props.value) {
            const currentLabel = props.label
              ? props.value[props.label]
              : props.value;
            return item.textContent?.trim() === currentLabel;
          }
          return false;
        });

        if (selected) {
          selected.classList.add('vs__dropdown-option--highlight');
          const element = document.querySelector('.vs__dropdown-menu');
          if (element) {
            element.scrollTop = selected.offsetTop;
          }
        }
      });
    }
    function handleResize() {
      currentHeight_.value = inputRef.value?.parentElement?.clientHeight || 0;
      context.emit('resize', currentHeight_.value);
    }

    return {
      isFloated_,
      isEmpty_,
      isInvalid,
      baseHeight_,
      currentHeight_,
      floatDisplacement,
      Deselect,
      OpenIndicator,
      inputIdSelector,
      inputRef,
      heightMultiplier,
      floatStyle,
      isEmpty: empty,
      isFloated,
      onInput,
      onBlur,
      open,
      handleResize,
    };
  },
});
</script>

<style>
@import '~vue-select/dist/vue-select.css';
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
