<template>
  <div>
    <div class="tabs" :class="classes">
      <ul class="flex items-center h-full">
        <li
          v-for="tab in tabs"
          :key="tab.name"
          :class="{
            'is-active': tab.isActive,
            disabled: tab.disabled,
            [tabClasses]: true,
          }"
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
  props: {
    classes: {
      type: String,
      default: '',
    },
    tabClasses: {
      type: String,
      default: '',
    },
  },
  data() {
    return { tabs: [] };
  },

  created() {
    this.tabs = this.$children;
  },
  mounted() {
    this.tabs[0].isActive = true;
    this.$emit('mounted', this);
  },
  computed: {
    isFirst() {
      return this.tabs[0].isActive === true;
    },
    isLast() {
      return this.tabs[this.tabs.length - 1].isActive === true;
    },
  },
  methods: {
    selectTab(selectedTab) {
      if (selectedTab.disabled) {
        return;
      }
      this.tabs.forEach((tab) => {
        tab.isActive = tab.name === selectedTab.name;
      });
      this.$emit('tabSelected', selectedTab.name);
    },
    nextTab() {
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].isActive === true) {
          this.selectTab(this.tabs[i + 1]);
        }
      }
    },
    previousTab() {
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].isActive === true) {
          this.selectTab(this.tabs[i - 1]);
        }
      }
    },
  },
};
</script>

<style scoped>
.is-active {
  @apply border-b-2 border-primary-light;
}
.disabled {
  @apply text-crisiscleanup-grey-900;
}
</style>
