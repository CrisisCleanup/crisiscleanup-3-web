<template>
  <div class="m-input">
    <FormSelect
      v-bind="$attrs"
      :value="selected"
      searchable
      item-key="id"
      :options="options(items)"
      @input="(value) => onSelected(value)"
      :select-classes="`bg-white border border-crisiscleanup-${
        errorDetail ? 'red-100' : 'dark'
      }`"
      indicator-icon="caret-down"
      :float-label="$t(floatLabel) || name"
      :multiple="multi"
    >
      <template #float-label="{ isFloated }">
        {{ $t(floatLabel) || name | startCase }}
        <span
          v-if="description"
          class="
            transition transition-opacity
            duration-150
            ease-in-out
            text-h4 text-crisiscleanup-dark-200
          "
          :class="[isFloated && 'opacity-0']"
          >({{ description }})</span
        >
      </template>
      <template #option="{ option }">
        <slot name="option" :option="option" />
      </template>
      <template #selected-option="{ option }">
        <slot name="selected-option" :option="option" />
      </template>
    </FormSelect>
    <slot name="detail" v-bind="{ value }">
      <div class="m-input__detail">
        <base-text
          v-if="!errorDetail"
          variant="bodyxsm"
          class="text-crisiscleanup-dark-400 pl-1"
        >
          {{ value && value.description_t ? value.description_t : '' }}
        </base-text>
        <base-text
          v-if="errorDetail"
          variant="bodyxsm"
          class="text-crisiscleanup-red-900 pl-1"
          bold
        >
          {{ $t(errorDetail) }}
        </base-text>
      </div>
    </slot>
  </div>
</template>

<script>
// @flow
import VueTypes from 'vue-types';
import useSelectForm from '@/use/useSelectForm';
import type { SelectFormProps } from '@/use/useSelectForm';
import FormSelect from '@/components/FormSelect.vue';
import { toRefs, watchEffect } from '@vue/composition-api';

export type ModelSelectInputProps = {|
  name: string,
  description?: string,
  model: any,
  multi?: boolean,
  translate?: boolean,
  resolveFetch?: $ElementType<SelectFormProps, 'resolveFetch'>,
  resolveFromId?: $ElementType<SelectFormProps, 'resolveFromId'>,
  floatLabel?: string,
  errorDetail?: string,
  value?: any[],
  sortKey?: string,
  options?: Function,
|};

// Select model item(s) from a form select.
export default {
  name: 'ModelSelectInput',
  components: { FormSelect },
  props: ({
    // Form name, converted to start case for label.
    name: VueTypes.string.def(''),
    // Description to add to float label.
    description: VueTypes.string,
    // VuexORM model (or entity name) to use as queryset.
    model: VueTypes.any,
    // Auto translate model items.
    translate: VueTypes.bool.def(false),
    // Allow multi select.
    multi: VueTypes.bool.def(false),
    // Custom resolver for initial model fetch.
    resolveFetch: VueTypes.any,
    // Custom resolution of item id.
    resolveFromId: VueTypes.any,
    // Custom float label.
    floatLabel: VueTypes.string,
    // Error detail
    errorDetail: VueTypes.string,
    // Override selected items
    selected: VueTypes.any,
    // Element key to sort options by.
    sortKey: VueTypes.string,
    // Custom Options callback.
    options: VueTypes.func.def((opts) => opts),
  }: ModelSelectInputProps),
  setup(props, context) {
    const {
      name,
      model,
      multi,
      translate,
      resolveFetch,
      resolveFromId,
      sortKey,
    } = toRefs(props);

    let _model = model.value;
    if (typeof _model === 'string') {
      _model = context.root.$store.$db().model(_model);
    }

    const { items, onSelected, value } = useSelectForm<model>({
      context,
      multi: multi.value,
      model: _model,
      translate: translate.value,
      resolveFetch: resolveFetch.value,
      resolveFromId: resolveFromId.value,
      sortKey: sortKey.value,
    });

    watchEffect(() => {
      context.emit('update:value', [name, value]);
    });

    return {
      items,
      onSelected,
      value,
    };
  },
};
</script>

<style scoped>
.m-input {
  &__detail {
    transition: height 500ms ease;
    min-height: 20px;
  }
}
</style>
