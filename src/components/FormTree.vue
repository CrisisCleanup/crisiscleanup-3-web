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
        <div class="form-field flex items-center justify-between">
          <base-checkbox
            :value="
              Boolean(dynamicFields[field.field_key]) || hasSelectedChildren
            "
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
                updateChildren(field, value);
                showChildren = !showChildren;
              }
            "
          >
            <div class="text-base font-semibold">
              {{ field.label_t }}
            </div>
          </base-checkbox>
          <WorksiteStatusDropdown
            v-if="worksite.id && canChangeStatus && currentWorkType"
            class="block"
            :phase="incident.phase"
            :current-work-type="currentWorkType"
            @input="
              (value) => {
                $emit('updateWorkTypeStatus', {
                  work_type: field.if_selected_then_work_type,
                  status: value,
                });
              }
            "
          />
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
            :value="dynamicFields[field.field_key]"
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
            :value="
              dynamicFields[field.field_key] &&
              dynamicFields[field.field_key].split(',')
            "
            multiple
            :options="
              field.values || getSelectValuesList(field.values_default_t)
            "
            item-key="value"
            label="name_t"
            select-classes="bg-white border text-xs role-select p-1 form-multiselect"
            @input="
              (value) => {
                $emit('updateField', {
                  key: field.field_key,
                  value: value.join(','),
                });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'text'">
        <div :key="field.field_key" class="form-field">
          <base-input
            :value="dynamicFields[field.field_key]"
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
            :value="dynamicFields[field.field_key] || field.recur_default"
            :is-default="!dynamicFields[field.field_key]"
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
            :value="dynamicFields[field.field_key]"
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
          <base-input
            text-area
            :disabled="false"
            :rows="4"
            :value="dynamicFields[field.field_key]"
            :placeholder="field.placeholder_t || field.label_t"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'checkbox'">
        <div :key="field.field_key" class="form-field flex items-center">
          <base-checkbox
            :value="dynamicFields[field.field_key]"
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
      :dynamic-fields="dynamicFields"
      @updateField="
        ({ key, value }) => {
          $emit('updateField', { key, value });
        }
      "
      @updateWorkTypeStatus="
        ({ work_type, status }) => {
          $emit('updateWorkTypeStatus', { work_type, status });
        }
      "
    />
  </div>
</template>
<script>
import { mapState } from 'vuex';
import SectionHeading from './SectionHeading';
import RecurringSchedule from './RecurringSchedule';
import Incident from '@/models/Incident';
import WorksiteStatusDropdown from '@/components/WorksiteStatusDropdown';
import User from '@/models/User';

export default {
  props: {
    worksite: {
      type: Object,
      default: () => ({}),
    },
    dynamicFields: {
      type: Object,
      default: () => ({}),
    },
    children: {
      type: Array,
      default: () => [],
    },
    field: {
      type: Object,
      default: () => ({}),
    },
  },
  components: { WorksiteStatusDropdown, SectionHeading, RecurringSchedule },
  name: 'FormTree',
  data() {
    return {
      showChildren: true,
    };
  },
  mounted() {
    if (this.field.if_selected_then_work_type) {
      this.showChildren = Boolean(this.dynamicFields[this.field.field_key]);
    }

    const hasSelectedChildren = this.field.children.some((childField) => {
      return (
        childField.if_selected_then_work_type &&
        Boolean(this.dynamicFields[childField.field_key])
      );
    });
    if (hasSelectedChildren) {
      this.showChildren = true;
    }
  },
  computed: {
    ...mapState('incident', ['currentIncidentId']),
    incident() {
      return Incident.find(this.currentIncidentId);
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    canChangeStatus() {
      return (
        !this.currentWorkType?.claimed_by ||
        this.currentWorkType?.claimed_by === this.currentUser.organization.id
      );
    },
    currentWorkType() {
      return this.worksite.work_types.find(
        (wt) => wt.work_type === this.field.if_selected_then_work_type,
      );
    },
    hasSelectedChildren() {
      return this.field.children.some((childField) => {
        return (
          childField.if_selected_then_work_type &&
          Boolean(this.dynamicFields[childField.field_key])
        );
      });
    },
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
    updateChildren(field, value) {
      if (!value) {
        field.children.forEach((child) => {
          this.$emit('updateField', {
            key: child.field_key,
            value: child.html_type === 'checkbox' ? false : '',
          });
        });
      }
    },
  },
};
</script>

<style>
.form-field {
  @apply py-1 mx-3;
}
.form-multiselect .vs__selected {
  @apply text-xs bg-white !important;
}
</style>
