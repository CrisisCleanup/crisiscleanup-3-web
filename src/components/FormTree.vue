<template>
  <div class="form-tree">
    <div :key="field.field_key">
      <template v-if="['h4'].includes(field.html_type)">
        <SectionHeading
          :count="getSectionCount(field)"
          :tooltip="field.help_t"
          class="mb-3"
          >{{ field.label_t }}</SectionHeading
        >
      </template>
      <template v-if="['h5'].includes(field.html_type)">
        <div class="form-field flex items-center">
          <base-checkbox
            :value="worksite.formFields[field.field_key]"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
                showChildren = !showChildren;
              }
            "
          >
            <div class="text-base font-semibold">
              {{ field.label_t }}
            </div>
          </base-checkbox>
        </div>
      </template>
      <template v-if="field.html_type === 'select'">
        <div :key="field.field_key" class="form-field">
          <span slot="label" class="flex items-center">
            <span>{{ field.label_t }}</span>
            <ccu-icon
              v-if="field.help_t"
              v-tooltip="{
                content: field.help_t,
                trigger: 'hover',
                classes: 'interactive-tooltip w-72',
              }"
              :alt="$t('actions.help_alt')"
              type="help"
              size="large"
            />
          </span>
          <form-select
            :value="worksite.formFields[field.field_key]"
            :options="
              field.values || getSelectValuesList(field.values_default_t)
            "
            item-key="value"
            label="name_t"
            select-classes="h-12 border"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'multiselect'">
        <div :key="field.field_key" class="form-field">
          <span slot="label" class="flex items-center">
            <span>{{ field.label_t }}</span>
            <ccu-icon
              v-if="field.help_t"
              v-tooltip="{
                content: field.help_t,
                trigger: 'hover',
                classes: 'interactive-tooltip w-72',
              }"
              :alt="$t('actions.help_alt')"
              type="help"
              size="large"
            />
          </span>
          <form-select
            :value="worksite.formFields[field.field_key]"
            multiple
            :options="field.values"
            item-key="value"
            label="name_t"
            select-classes="h-12 border"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'text'">
        <div :key="field.field_key" class="form-field">
          <base-input
            :value="worksite.formFields[field.field_key]"
            :tooltip="field.help_t"
            size="large"
            :break-glass="field.read_only_break_glass"
            :placeholder="field.placeholder_t || field.label_t"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'cronselect'">
        <div class="form-field">
          <div class="mb-1">{{ field.label_t }}</div>
          <RecurringSchedule
            :value="worksite.formFields[field.field_key]"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'suggest'">
        <div :key="field.field_key" class="form-field">
          <autocomplete
            :value="worksite.formFields[field.field_key]"
            :default-value="getValue(field.field_key)"
            tooltip="info"
            display-property="description"
            :placeholder="field.placeholder_t || field.label_t"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'textarea'">
        <div :key="field.field_key" class="form-field">
          <span slot="label" class="flex items-center">
            <span>{{ field.label_t }}</span>
            <ccu-icon
              v-if="field.help_t"
              v-tooltip="{
                content: field.help_t,
                trigger: 'hover',
                classes: 'interactive-tooltip w-72',
              }"
              :alt="$t('actions.help_alt')"
              type="help"
              size="large"
            />
          </span>
          <textarea
            class="block w-full border outline-none"
            :placeholder="field.placeholder_t || field.label_t"
            rows="4"
            :value="worksite.formFields[field.field_key]"
            @input="
              (e) => {
                $emit('updateField', {
                  key: field.field_key,
                  value: e.target.value,
                });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'checkbox'">
        <div :key="field.field_key" class="form-field flex items-center">
          <base-checkbox
            :value="worksite.formFields[field.field_key]"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
            >{{ field.label_t }}
          </base-checkbox>
          <ccu-icon
            v-if="field.help_t"
            v-tooltip="{
              content: field.help_t,
              trigger: 'hover',
              classes: 'interactive-tooltip w-72',
            }"
            :alt="$t('actions.help_alt')"
            type="help"
            size="large"
          />
        </div>
      </template>
    </div>
    <form-tree
      v-show="showChildren"
      v-for="item in field.children"
      :children="item.children"
      :field="item"
      :key="item.field_key"
      :worksite="worksite"
      @updateField="
        ({ key, value }) => {
          $emit('updateField', { key, value });
        }
      "
    />
  </div>
</template>
<script>
import SectionHeading from './SectionHeading';
import RecurringSchedule from './RecurringSchedule';

export default {
  props: ['field', 'children', 'worksite'],
  components: { SectionHeading, RecurringSchedule },
  name: 'FormTree',
  data() {
    return {
      showChildren: true,
    };
  },
  mounted() {
    if (this.field.if_selected_then_work_type) {
      this.showChildren = Boolean(
        this.worksite.formFields[this.field.field_key],
      );
    }
  },
  methods: {
    getValue(fieldKey) {
      if (!this.worksite || !this.worksite.form_data) {
        return '';
      }

      const key = this.worksite.form_data.find((element) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        this.$log.debug(`${fieldKey}:${key.field_value}`);

        return key.field_value;
      }
      return '';
    },
    getSectionCount(currentField) {
      return currentField.order_label;
    },
    getSelectValuesList(defaultValues) {
      return Object.keys(defaultValues).map((key) => {
        return {
          value: key,
          name_t: this.$t(defaultValues[key]),
        };
      });
    },
  },
};
</script>

<style>
.form-field {
  @apply py-1 mx-3;
}
</style>
