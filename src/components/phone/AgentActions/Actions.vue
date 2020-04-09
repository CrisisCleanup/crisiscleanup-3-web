<template>
  <div class="agent-actions shadow-crisiscleanup-card">
    <div class="tabbar">
      <div
        @click="() => setActionTab(t.key)"
        v-for="t in actionTabs"
        :key="t.title"
        :class="`tab ${t.key === currentActionTab ? 'active' : ''}`"
      >
        <ccu-icon v-if="t.icon" with-text size="medium" :type="t.icon">
          <base-text variant="h3">
            {{ $t(t.title) }}
          </base-text>
        </ccu-icon>
        <base-text variant="h3" v-if="!t.icon">
          {{ $t(t.title) }}
        </base-text>
      </div>
    </div>
    <div
      class="flex flex-grow"
      v-show="t.key === currentActionTab"
      v-for="t in actionTabs"
      :key="t.key"
    >
      <slot :name="t.key" />
    </div>
    <!-- <slot v-for="t in actionTabs" :name="t.key" /> -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'AgentActions',
  computed: {
    ...mapGetters('phone', ['currentActionTab']),
    actionTabs() {
      return [
        {
          key: 'case',
          icon: 'active',
          title: '~~New Case',
        },
        {
          key: 'resources',
          title: '~~Resources',
        },
      ];
    },
  },
  methods: {
    ...mapActions('phone', ['setActionTab']),
  },
};
</script>

<style lang="scss" scoped>
.agent-actions {
  display: flex;
  flex-direction: column;
  margin-top: -1.5rem;
  margin-bottom: -1.5rem;
  @apply w-full;
  .tabbar {
    display: flex;
    justify-content: space-around;

    @apply bg-white;
    box-shadow: 0 2px 10px 0 fade-out(#000, 0.95);
    .tab {
      position: relative;
      display: flex;
      justify-content: center;
      flex-grow: 1;
      @apply p-4 px-6;
      transition: background-color 500ms ease;
      cursor: pointer;
      &:hover {
        @apply bg-crisiscleanup-light-grey;
      }
      p {
        @apply text-crisiscleanup-dark-500;
      }
      &.active:after {
        content: '';
        @apply bg-primary-light;
        height: 3px;
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
      }
    }
  }
}
</style>
