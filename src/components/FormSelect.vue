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

<script>
import { xor, kebabCase, isEmpty } from 'lodash';
export default {
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
  data() {
    const iconSize = this.multiple ? 'xxs' : 'medium';
    const { indicatorIcon } = this;
    const cancelText = this.$t('actions.cancel');
    return {
      isFloated_: false,
      isEmpty_: true,
      isInvalid: false,
      baseHeight_: 0.0,
      currentHeight_: 0.0,
      floatDisplacement: 0,
      Deselect: {
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
      },
      OpenIndicator: {
        render() {
          return (
            <font-awesome-icon
              size="sm"
              icon={indicatorIcon}
              class="mx-1 text-crisiscleanup-dark-400"
            />
          );
        },
      },
    };
  },
  computed: {
    inputIdSelector() {
      const idSpec = this.floatLabel ? this.floatLabel : '';
      return `select-id-${kebabCase(idSpec)}`;
    },
    inputRef() {
      if (this.$refs.input) return this.$refs.input;
      return document.getElementById(this.inputIdSelector);
    },
    heightMultiplier() {
      if (this.currentHeight_ === 0.0) return 1;
      this.$log.debug('current container height:', this.currentHeight_);
      const multi = this.currentHeight_ / this.baseHeight_;
      this.$log.debug('height multiplier change: ', multi);
      return multi;
    },
    floatStyle() {
      const displace = this.heightMultiplier * -12;
      return { transform: `translateY(${displace}px)` };
    },
    isEmpty() {
      if (this.value !== null) {
        return isEmpty(this.value);
      }
      return this.isEmpty_;
    },
    isFloated() {
      if (this.isFloated_ === true) {
        return true;
      }
      if (this.isEmpty === false) {
        return true;
      }
      return this.isFloated_;
    },
  },
  mounted() {
    this.id = this._uid;
    if (this.required) {
      this.$refs.input.addEventListener(
        'invalid',
        () => {
          this.isInvalid = true;
        },
        true,
      );
    }
    if (this.floatLabel) {
      this.inputRef.parentElement.classList.add('has-float');
      this.baseHeight_ = this.inputRef.parentElement.clientHeight;
    }
  },
  methods: {
    onInput(value) {
      this.$emit('input', value);
      this.isEmpty_ = value === null;
      if (value === null && this.floatLabel) {
        this.isFloated_ = false;
        this.$refs.inputLabel.classList.remove('focused');
      }
      if (this.multiple) {
        const current = this.value || [];
        this.$emit(
          'changed',
          xor(
            value,
            current.map((item) => (this.itemKey ? item[this.itemKey] : item)),
          ),
        );
      }
      if (this.required) {
        if (this.$refs.input.checkValidity()) {
          this.isInvalid = false;
        }
      }
    },
    onBlur() {
      if (this.floatLabel && this.isEmpty) {
        this.isFloated_ = false;
        this.$refs.inputLabel.classList.remove('focused');
      }
    },
    open() {
      if (this.floatLabel) {
        this.isFloated_ = true;
        this.$refs.inputLabel.classList.add('focused');
      }
      this.$nextTick(() => {
        const items = [].slice.call(
          document.querySelectorAll('.vs__dropdown-option'),
        );

        items.forEach((item) => {
          item.classList.remove('vs__dropdown-option--highlight');
        });

        const selected = items.find((item) => {
          if (this.value) {
            const currentLabel = this.label
              ? this.value[this.label]
              : this.value;
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
    },
    handleResize() {
      this.currentHeight_ = this.inputRef.parentElement.clientHeight;
      this.$emit('resize', this.currentHeight_);
    },
  },
};
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
