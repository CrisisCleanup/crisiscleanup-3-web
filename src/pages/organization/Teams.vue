<template>
  <div class="p-8">
    <base-input
      v-model="currentSearch"
      icon="search"
      class="w-84 mr-4 mb-6"
      :placeholder="$t('actions.search')"
      @input="onSearch"
    ></base-input>
    <div style="display: grid; grid-template-columns: auto auto;">
      <div style="display: grid; grid-template-columns: auto;">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Teams',
  methods: {
    async onSearch() {
      return 1;
    },
  },
  data() {
    return { currentSearch: null };
  },
};
</script>

<style scoped></style>
