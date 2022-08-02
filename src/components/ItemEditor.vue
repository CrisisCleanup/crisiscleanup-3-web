<template>
  <div class="p-4 h-108 overflow-auto">
    <div v-for="prop in Object.keys(currentObject)" :key="prop">
      <div>{{ prop }}</div>
      <pre
        contenteditable="true"
        class="my-editor"
        @input="({ target }) => updateProperty(prop, target.innerHTML)"
        v-html="beautify(JSON.stringify(currentObject[prop]))"
      ></pre>
    </div>
  </div>
</template>

<script>
const beautify = require('js-beautify').js; // import the styles somewhere

export default {
  name: 'ItemEditor',
  mounted() {
    this.currentObject = this.mergeObjects(this.item, this.initialObject);
    Object.keys(this.currentObject).forEach((key) => {
      this.updateProperty(key, this.currentObject[key]);
    });
    delete this.currentObject.children;
  },
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      beautify,
      currentObject: {},
      initialObject: {
        values: null,
        is_required: false,
        is_read_only: false,
        list_order: 0,
        field_key: '',
        field_parent_key: null,
        if_selected_then_work_type: null,
        phase: 4,
      },
    };
  },
  methods: {
    mergeObjects(obj1, obj2) {
      const common = (a, b) => {
        const result = {};

        Object.keys(b).forEach((key) => {
          result[key] = a[key] ?? b[key];
        });

        return result;
      };

      return common(obj1, obj2);
    },
    updateProperty(prop, value) {
      try {
        this.currentObject[prop] = JSON.parse(value);
        this.$emit('update', {
          field_key: this.item.field_key,
          prop,
          value: JSON.parse(value),
        });
      } catch (e) {
        const currentValue = this.currentObject[prop];
        this.currentObject[prop] = currentValue;
      }
    },
  },
};
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
