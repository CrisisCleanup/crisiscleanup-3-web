<template>
  <draggable
    v-bind="dragOptions"
    tag="div"
    class="item-container min-w-max"
    group="fields"
    :list="internalList"
    handle=".handle"
    @change="onListChange"
  >
    <template #item="{ element: field }">
      <div>
        <div
          v-if="!['hidden', 'divend'].includes(field.html_type)"
          class="flex items-center p-1 w-full mb-1 border bg-white"
        >
          <div class="handle min-w-max">
            <ccu-icon
              icon-classes="cursor-move"
              :alt="$t('actions.drag')"
              height="18"
              width="12"
              type="drag"
            />
          </div>
          <div :key="field.field_key" class="w-full">
            <template v-if="['h4'].includes(field.html_type)">
              <div class="flex items-center justify-between">
                <SectionHeading
                  class="sm:bg-white"
                  :count="field.order_label"
                  :tooltip="$t(field.help_t)"
                  >{{ $t(field.label_t) }}
                </SectionHeading>
                <base-button
                  :icon="showChildren[field.field_key] ? 'minus' : 'plus'"
                  :action="
                    () => {
                      showChildren[field.field_key] =
                        !showChildren[field.field_key];
                      showChildren = { ...showChildren };
                    }
                  "
                />
              </div>
            </template>
            <template v-if="['h5'].includes(field.html_type)">
              <div class="form-field flex items-center justify-between">
                <base-checkbox>
                  <div class="text-base font-semibold">
                    {{ $t(field.label_t) }}
                  </div>
                </base-checkbox>
              </div>
            </template>
            <template v-if="field.html_type === 'select'">
              <div :key="field.field_key" class="form-field">
                <span slot="label" class="flex items-center">
                  <span>{{ $t(field.label_t) }}</span>
                  <ccu-icon
                    v-if="field.help_t"
                    v-tooltip="{
                      content: $t(field.help_t),
                      triggers: ['hover'],
                      popperClass: 'interactive-tooltip w-72',
                      html: true,
                    }"
                    :alt="$t('actions.help_alt')"
                    type="help"
                    size="large"
                  />
                </span>
                <base-select
                  :options="
                    (field.values &&
                      field.values.map((item) => {
                        return {
                          value: item.value,
                          name_t: $t(item.name_t),
                        };
                      })) ||
                    getSelectValuesList(field.values_default_t)
                  "
                  item-key="value"
                  label="name_t"
                  select-classes="h-12 border"
                />
              </div>
            </template>
            <template v-if="field.html_type === 'multiselect'">
              <div :key="field.field_key" class="form-field">
                <span slot="label" class="flex items-center">
                  <span>{{ $t(field.label_t) }}</span>
                  <ccu-icon
                    v-if="field.help_t"
                    v-tooltip="{
                      content: $t(field.help_t),
                      triggers: ['hover'],
                      popperClass: 'interactive-tooltip w-72',
                      html: true,
                    }"
                    :alt="$t('actions.help_alt')"
                    type="help"
                    size="large"
                  />
                </span>
                <base-select
                  multiple
                  :options="
                    (field.values &&
                      field.values.map((item) => {
                        return {
                          value: item.value,
                          name_t: $t(item.name_t),
                        };
                      })) ||
                    getSelectValuesList(field.values_default_t)
                  "
                  item-key="value"
                  label="name_t"
                  select-classes="bg-white border text-xs role-select p-1 form-multiselect"
                />
              </div>
            </template>
            <template v-if="field.html_type === 'text'">
              <div :key="field.field_key" class="form-field">
                <base-input
                  :tooltip="$t(field.help_t)"
                  size="large"
                  :break-glass="field.read_only_break_glass"
                  :placeholder="$t(field.placeholder_t) || $t(field.label_t)"
                />
              </div>
            </template>
            <template v-if="field.html_type === 'cronselect'">
              <div class="form-field">
                <div class="mb-1">{{ $t(field.label_t) }}</div>
                <RecurringSchedule
                  :value="field.recur_default"
                  :is-default="false"
                />
              </div>
            </template>
            <template v-if="field.html_type === 'suggest'">
              <div :key="field.field_key" class="form-field">
                <autocomplete
                  tooltip="info"
                  display-property="description"
                  :placeholder="$t(field.placeholder_t) || $t(field.label_t)"
                />
              </div>
            </template>
            <template v-if="field.html_type === 'textarea'">
              <div :key="field.field_key" class="form-field">
                <span slot="label" class="flex items-center">
                  <span>{{ $t(field.label_t) }}</span>
                  <ccu-icon
                    v-if="field.help_t"
                    v-tooltip="{
                      content: $t(field.help_t),
                      triggers: ['hover'],
                      html: true,
                      popperClass: 'interactive-tooltip w-72',
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
                  :placeholder="$t(field.placeholder_t) || $t(field.label_t)"
                />
              </div>
            </template>
            <template v-if="field.html_type === 'checkbox'">
              <div :key="field.field_key" class="form-field flex items-center">
                <base-checkbox>{{ $t(field.label_t) }}</base-checkbox>
                <ccu-icon
                  v-if="field.help_t"
                  v-tooltip="{
                    content: $t(field.help_t),
                    triggers: ['hover'],
                    html: true,
                    popperClass: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('actions.help_alt')"
                  type="help"
                  size="large"
                />
              </div>
            </template>
          </div>
          <div v-if="!['h4'].includes(field.html_type)" class="min-w-max">
            <div class="flex mr-2 justify-center w-full">
              <ccu-icon
                :alt="$t('actions.edit')"
                size="small"
                type="edit"
                class="mx-2"
                @click="
                  () => {
                    editField(field);
                  }
                "
              />
              <ccu-icon
                :alt="$t('actions.delete')"
                size="small"
                type="trash"
                class="mx-2"
                @click="$emit('deleteItem', field.field_key)"
              />
            </div>
          </div>
        </div>
        <nested-builder-item
          v-show="
            showChildren[field.field_key] || !['h4'].includes(field.html_type)
          "
          :key="JSON.stringify(field.children)"
          class="item-sub"
          :list="field.children"
          @deleteItem="(value) => deleteItem(field, value)"
          @change="(value) => onChildChange(field, value)"
          @update="$emit('update', $event)"
        />
        <ItemEditor v-if="editing" :item="field" @close="editing = false" />
      </div>
    </template>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import SectionHeading from '@/components/work/SectionHeading.vue';
import RecurringSchedule from '@/components/RecurringSchedule.vue';
import ItemEditor from '@/components/ItemEditor.vue';
import useDialogs from '@/hooks/useDialogs';

export default {
  name: 'NestedBuilderItem',
  components: {
    ItemEditor,
    RecurringSchedule,
    SectionHeading,
    draggable,
  },
  props: {
    value: {
      required: false,
      type: Array,
      default: null,
    },
    list: {
      required: false,
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { component } = useDialogs();

    const showChildren = ref({});
    const editing = ref(false);
    const internalList = ref([]);

    const dragOptions = {
      animation: 0,
      group: 'description',
      disabled: false,
      ghostClass: 'ghost',
    };

    function getSelectValuesList(defaultValues) {
      return Object.keys(defaultValues).map((key) => {
        return {
          value: key,
          name_t: t(defaultValues[key]),
        };
      });
    }
    async function editField(field) {
      await component({
        title: t('actions.edit'),
        component: ItemEditor,
        actionText: t('actions.done'),
        listeners: {
          update: (payload) => {
            emit('update', payload);
          },
        },
        props: {
          item: field,
        },
      });
    }
    function onListChange(change) {
      if (change.added) {
        change.added.element.phase = 4;
        change.added.element.children = [];
      }
      internalList.value = [...internalList.value];
      nextTick(() => {
        emit('change', internalList.value);
      });
    }
    function deleteItem(field, key) {
      field.children = field.children.filter((f) => f.field_key !== key);
      nextTick(() => {
        emit('change', internalList.value);
      });
    }
    function onChildChange(field, change) {
      field.children = [...field.children, change.added.element];
      nextTick(() => {
        emit('change', internalList.value);
      });
    }

    onMounted(() => {
      if (props.list) {
        internalList.value = [...props.list];
        for (const field of internalList.value) {
          if (!field.children) {
            field.children = [];
          }
        }
      }
    });

    watch(
      () => props.list,
      (value) => {
        internalList.value = [...value];
      },
    );

    return {
      showChildren,
      editing,
      internalList,
      getSelectValuesList,
      editField,
      onListChange,
      deleteItem,
      onChildChange,
      dragOptions,
      $t: (text) => {
        return text ? t(text) : null;
      },
    };
  },
};
</script>

<style scoped>
.item-container {
  margin: 0;
}

.item {
  padding: 1rem;
  border: solid black 1px;
  background-color: #fefefe;
}
.item-sub {
  padding: 0 0 0 1rem;
}
</style>

<style scoped>
.form-field {
  @apply w-96;
}
</style>
