<template>
  <div class="assessment-tree">
    <div :key="field.field_key">
      <template v-if="['h4'].includes(field.html_type)">
        <div class="form-field text-lg font-semibold">
          {{ field.label_t }}
        </div>
      </template>
      <template v-if="['h5'].includes(field.html_type)">
        <div :key="field.field_key" class="py-1 mx-5">
          <input
            type="checkbox"
            :id="field.field_key"
            :value="pda.formFields[field.field_key]"
            @input="
              (e) => {
                $emit('updateField', {
                  key: field.field_key,
                  value: e.target.checked,
                });
                showChildren = !showChildren;
              }
            "
          />
          <label
            :for="field.field_key"
            class="px-2 text-base font-semibold my-1 mx-3"
            >{{ field.placeholder_t || field.label_t }}
          </label>
        </div>
      </template>
      <template v-if="field.html_type === 'select'">
        <div :key="field.field_key" class="form-field">
          <span>{{ field.label_t }}</span>
          <form-select
            :value="pda.formFields[field.field_key]"
            :options="
              field.values || getSelectValuesList(field.values_default_t)
            "
            indicator-icon="caret-down"
            item-key="value"
            label="name_t"
            select-classes="h-10 border bg-white"
            @input="
              (value) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'cronselect'">
        <div key="field.field_key" class="form-field">
          <span>{{ field.label_t }}</span>
          <RecurringSchedule
            :value="pda.formFields[field.field_key]"
            container-class="bg-white"
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
          <span>{{ field.label_t }}</span>
          <form-select
            :value="
              pda.formFields[field.field_key] &&
              pda.formFields[field.field_key].split(',')
            "
            :options="
              field.values || getSelectValuesList(field.values_default_t)
            "
            multiple
            indicator-icon="caret-down"
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
          <label>{{ field.placeholder_t || field.label_t }}</label>
          <input
            :value="pda.formFields[field.field_key]"
            class="js-pda-postal_code input"
            size="large"
            type="text"
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
      <template v-if="field.html_type === 'textarea'">
        <div :key="field.field_key" class="form-field">
          <label>{{ field.placeholder_t || field.label_t }}</label>
          <textarea
            class="block w-full border outline-none"
            rows="3"
            :value="pda.formFields[field.field_key]"
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
        <div :key="field.field_key" class="py-1 mx-5">
          <input
            type="checkbox"
            :id="field.field_key"
            :value="pda.formFields[field.field_key]"
            @input="
              (e) => {
                $emit('updateField', {
                  key: field.field_key,
                  value: e.target.checked,
                });
              }
            "
          />
          <label :for="field.field_key" class="px-2">{{
            field.placeholder_t || field.label_t
          }}</label>
        </div>
      </template>
    </div>
    <assessment-tree
      v-show="showChildren"
      v-for="item in field.children"
      :children="item.children"
      :field="item"
      :key="item.field_key"
      :pda="pda"
      @updateField="
        ({ key, value }) => {
          $emit('updateField', { key, value });
        }
      "
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api';
import RecurringSchedule from '@/components/RecurringSchedule.vue';
import usei18n from '@/use/usei18n';

export default defineComponent({
  name: 'AssessmentTree',
  props: ['field', 'children', 'pda'],
  components: { RecurringSchedule },

  setup(props) {
    const showChildren = ref(true);
    const { $t } = usei18n();

    onMounted(async () => {
      if (props.field.if_selected_then_work_type) {
        showChildren.value = Boolean(
          props.pda.formFields[props.field.field_key],
        );
      }
    });

    const getValue = (fieldKey) => {
      if (!props.pda || !props.pda.form_data) {
        return '';
      }

      const key = props.pda.form_data.find((element) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        return key.field_value;
      }
      return '';
    };
    const getSectionCount = (currentField) => {
      return currentField.order_label;
    };
    const getSelectValuesList = (defaultValues) => {
      return Object.keys(defaultValues).map((key) => {
        return {
          value: key,
          name_t: $t(defaultValues[key]),
        };
      });
    };

    return {
      showChildren,
      getValue,
      getSectionCount,
      getSelectValuesList,
    };
  },
});
</script>

<style scoped>
.ant-form-item {
  padding-top: 10px;
  margin: 0;
}

.intake-form {
  height: 600px;
  overflow: auto;
}

.card-footer {
  min-height: 80px;
}

.form-field {
  @apply py-1 mx-5 flex flex-col;
}

.form-field-row {
  @apply py-1 mx-3 flex flex-row;
}

.form-field > .input {
  @apply h-10 p-1 border outline-none;
}

h4 {
  font-size: 16px;
  font-weight: bold;
}

h5 {
  font-size: 14px;
  font-weight: bold;
}
</style>

<style>
.ccu-version-overlay {
  padding: 0 !important;
  bottom: -3px !important;
}

.ccu-version-overlay p {
  text-align: left !important;
}
</style>
