<template>
  <div class="p-4 h-108 overflow-auto">
    <template v-for="prop in Object.keys(currentObject)" :key="prop">
      <div>
        <div>{{ prop }}</div>
        <pre
          contenteditable="true"
          class="my-editor"
          @input="({ target }) => updateProperty(prop, target.innerHTML)"
          v-html="prettyFormat(JSON.stringify(currentObject[prop]))"
        ></pre>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { format as prettyFormat } from 'pretty-format';
import { onMounted, ref } from 'vue';

export default defineComponent({
  name: 'ItemEditor',
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const currentObject = ref({});
    const initialObject = ref({
      values: null,
      is_required: false,
      is_read_only: false,
      list_order: 0,
      field_key: '',
      field_parent_key: null,
      if_selected_then_work_type: null,
      phase: 4,
    });

    function mergeObjects(object1, object2) {
      const common = (a, b) => {
        const result = {};

        for (const key of Object.keys(b)) {
          result[key] = a[key] ?? b[key];
        }

        return result;
      };

      return common(object1, object2);
    }

    function updateProperty(prop, value) {
      try {
        currentObject.value[prop] = JSON.parse(value);
        emit('update', {
          field_key: props.item.field_key,
          prop,
          value: JSON.parse(value),
        });
      } catch {
        const currentValue = currentObject.value[prop];
        currentObject.value[prop] = currentValue;
      }
    }

    onMounted(() => {
      currentObject.value = mergeObjects(props.item, initialObject.value);
      for (const key of Object.keys(currentObject.value)) {
        updateProperty(key, currentObject.value[key]);
      }

      delete currentObject.value.children;
    });

    return {
      prettyFormat,
      currentObject,
      initialObject,
      mergeObjects,
      updateProperty,
    };
  },
});
</script>

<style>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  @apply bg-crisiscleanup-smoke;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>
