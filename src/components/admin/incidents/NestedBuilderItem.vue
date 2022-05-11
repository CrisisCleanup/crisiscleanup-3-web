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
    <div
      class="item-group bg-white"
      :key="field.field_key"
      v-for="field in internalList"
    >
      <div
        class="flex items-center p-1 w-full mb-1 border bg-white"
        v-if="!['hidden', 'divend'].includes(field.html_type)"
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
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('actions.help_alt')"
                  type="help"
                  size="large"
                />
              </span>
              <form-select
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
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('actions.help_alt')"
                  type="help"
                  size="large"
                />
              </span>
              <form-select
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
        <div class="min-w-max" v-if="!['h4'].includes(field.html_type)">
          <div class="flex mr-2 justify-center w-full">
            <ccu-icon
              :alt="$t('actions.edit')"
              size="small"
              type="edit"
              class="mx-2"
              @click.native="
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
              @click.native="$emit('deleteItem', field.field_key)"
            />
          </div>
        </div>
      </div>
      <nested-builder-item
        v-show="
          showChildren[field.field_key] || !['h4'].includes(field.html_type)
        "
        class="item-sub"
        :list="field.children"
        @deleteItem="(value) => deleteItem(field, value)"
        @change="(value) => onChildChange(field, value)"
        @update="$emit('update', $event)"
        :key="JSON.stringify(field.children)"
      />
      <ItemEditor @close="editing = false" v-if="editing" :item="field" />
    </div>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable';
import SectionHeading from '@/components/SectionHeading';
import RecurringSchedule from '@/components/RecurringSchedule';
import ItemEditor from '@/components/ItemEditor';
import { DialogsMixin } from '@/mixins';
export default {
  name: 'NestedBuilderItem',
  mixins: [DialogsMixin],
  components: {
    ItemEditor,
    RecurringSchedule,
    SectionHeading,
    draggable,
  },
  mounted() {
    if (this.list) {
      this.internalList = [...this.list];
      this.internalList.forEach((field) => {
        if (!field.children) {
          field.children = [];
        }
      });
    }
  },
  watch: {
    list: {
      handler(value) {
        this.internalList = [...value];
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      showChildren: {},
      editing: false,
      internalList: [],
    };
  },
  methods: {
    getSelectValuesList(defaultValues) {
      return Object.keys(defaultValues).map((key) => {
        return {
          value: key,
          name_t: this.$t(defaultValues[key]),
        };
      });
    },
    async editField(field) {
      await this.$component({
        title: this.$t('actions.edit'),
        component: ItemEditor,
        actionText: this.$t('actions.done'),
        listeners: {
          update: (payload) => {
            this.$emit('update', payload);
          },
        },
        props: {
          item: field,
        },
      });
    },
    onListChange(change) {
      if (change.added) {
        change.added.element.phase = 4;
        change.added.element.children = [];
      }
      this.internalList = [...this.internalList];
      this.$nextTick(() => {
        this.$emit('change', this.internalList);
      });
    },
    deleteItem(field, key) {
      field.children = field.children.filter((f) => f.field_key !== key);
      this.$nextTick(() => {
        this.$emit('change', this.internalList);
      });
    },
    onChildChange(field, value) {
      field.children = [...value];
      this.$nextTick(() => {
        this.$emit('change', this.internalList);
      });
    },
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost',
      };
    },
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
};
</script>

<style scoped>
.form-field {
  @apply w-96;
}
</style>
