<template>
  <div>
    <div class="tabs">
      <ul class="flex">
        <li
          v-for="tab in tabs"
          :class="{ 'is-active': tab.isActive }"
          class="py-1 px-3 border-b-2 last:flex-grow"
        >
          <a :href="tab.href" @click="selectTab(tab)">{{ tab.name }}</a>
        </li>
      </ul>
    </div>

    <div class="tabs-details p-3">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  data() {
    return { tabs: [] };
  },

  created() {
    this.tabs = this.$children;
  },
  mounted() {
    this.tabs[0].isActive = true;
  },
  methods: {
    selectTab(selectedTab) {
      this.tabs.forEach((tab) => {
        tab.isActive = tab.name === selectedTab.name;
      });
    },
  },
};
</script>

<style scoped>
.is-active {
  @apply border-b-2 border-primary-light;
}
</style>
