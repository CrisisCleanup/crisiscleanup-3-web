<template>
  <div
    :class="[
      'case-card',
      active && 'active',
      type === 'new' && 'new',
      interactive && 'interactive',
      small && 'small'
    ]"
  >
    <div v-if="type === 'new'" class="case--overlay">
      <ccu-icon
        :alt="$t('actions.create_new')"
        :type="icons.add_orange"
        size="xl"
        class="pb-1"
      />
      <base-text variant="h3" class="text-crisiscleanup-dark-500"
        >New Case</base-text
      >
    </div>
    <template v-if="type !== 'new'">
      <div class="case--head">
        <div
          v-if="worktype && (!(worktypes && worktypes.length) || !interactive)"
          class="case--svg"
          v-html="svg"
        />
        <div
          v-if="interactive && worktypes && worktypes.length"
          class="case--svgs"
        >
          <WorksiteStatusDropdown
            v-for="(w, idx) in worktypes"
            :key="`${w}_${idx}`"
            :current-work-type="w"
            :phase="w.phase"
            use-icon
            hide-name
            :icon-size="16"
            size="sm"
            @input="(value) => $emit('update:worktype', value, w)"
          />
        </div>
        <div class="case--title flex">
          <base-text variant="h3">{{ caseNumber }}</base-text>
        </div>
      </div>
      <div class="case--body">
        <base-text variant="bodysm">{{ `${address}, ${state}` }}</base-text>
      </div>
    </template>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { IconsMixin } from '@/mixins';
import WorksiteStatusDropdown from '@/components/WorksiteStatusDropdown';

export default {
  name: 'CaseTile',
  components: { WorksiteStatusDropdown },
  mixins: [IconsMixin],

  props: {
    id: VueTypes.string,
    caseNumber: VueTypes.string,
    address: VueTypes.string,
    state: VueTypes.string,
    worktype: VueTypes.string,
    worktypes: VueTypes.array,
    interactive: VueTypes.bool.def(true),
    small: VueTypes.bool.def(false),
    svg: VueTypes.string,
    active: VueTypes.bool.def(false),
    type: VueTypes.any,
  },
};
</script>

<style scoped lang="postcss">
@lost flexbox flex;
.case-card {
  @apply bg-crisiscleanup-smoke p-4;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 12rem;
  height: 8rem;
  user-select: none;

  &.small {
    width: 10rem;
    height: 7rem;
  }

  &.interactive {
    cursor: pointer;
    @apply border-gray-300;
    transition: box-shadow 300ms ease;
    &:hover {
      @apply shadow-lg;
    }
  }

  &.active {
    @apply border-primary-light;
    border-width: 2px;
  }
  &.new {
    position: relative;
    .case {
      &--overlay {
        position: absolute;
        display: flex;
        flex-direction: column;
        @apply w-full h-full;
        left: 0;
        justify-content: center;
        align-items: center;
      }
      &--head,
      &--body {
        filter: blur(1.5px);
      }
    }
  }
  .case {
    &--head {
      display: inline-flex;
      align-items: center;
      p {
        @apply px-3 text-crisiscleanup-dark-400;
      }
    }
    &--title {
      display: flex;
      flex: 0.5;
    }
    &--svgs {
      flex: 1;
      lost-flex-container: row;
      div {
        lost-waffle: 1/2 2 2px;
      }
    }
    &--body {
      display: flex;
      p {
        @apply text-crisiscleanup-dark-400;
      }
    }
  }
}
</style>
