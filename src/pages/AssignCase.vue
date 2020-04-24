<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <!-- Header -->
        <div class="flex-col">
          <div class="flex flex-row mb-5">
            <h1 class="text-2xl font-bold">
              Assign Case
            </h1>
          </div>
          <!-- Search Bar -->
          <div class="flex flex-row w-2/3">
            <div class="flex flex-col w-2/3">
              <base-input placeholder="Search" />
            </div>
            <!-- Settings Button -->
            <div class="flex flex-col">
              <base-button ccu-icon="filters" class="w-full h-full" />
            </div>
          </div>
          <!-- divider line
          <div class="flex-row my-2">
              <hr />
          </div>-->
          <div class="flex flex-row shadow mt-4 w-1/2">
            <div class="flex-col">
              <CaseOverview class="m-3" />
            </div>
          </div>
          <div class="flex flex-row shadow mt-4 w-1/2">
            <div class="flex-col">
              <CaseOverview class="m-3" />
            </div>
          </div>
          <!-- Assign to Team Button -->
          <div class="flex flex-row w-1/2 mt-4">
            <base-button variant="solid" class="w-full py-2">
              Assign to Team
            </base-button>
          </div>
        </div>
        <home-footer />
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout, { HomeNav, HomeFooter, HomeActions } from '@/layouts/Home';
import { mapActions, mapGetters } from 'vuex';
import User from '@/models/User';
import CaseOverview from '@/components/CaseOverview.vue';

export default {
  name: 'AssignCasePage',
  components: {
    HomeLayout,
    HomeFooter,
    HomeNav,
    HomeActions,
    CaseOverview,
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    ...mapGetters('phone', [
      'connectReady',
      'agentState',
      'contactState',
      'callIncoming',
      'contactMetrics',
    ]),
  },
  methods: {
    ...mapActions('phone', ['getRealtimeMetrics']),
  },
  async mounted() {
    this.loading = true;
    await this.getRealtimeMetrics();
    this.loading = false;
  },
};
</script>

<style scoped lang="scss">
$areas: leader train story;

.grid--main {
  .dash-grid {
    display: inline-grid;
    grid-gap: 2rem;
    grid:
      [r1] 'leader' [r1end]
      [r2] 'train' [r2end]
      [r3] 'story' [r3end]
      / auto;
    .grid {
      @each $area in $areas {
        &--#{$area} {
          grid-area: $area;
        }
      }
    }
  }
}
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main main main'
      'nav . main main main main'
      'actions actions main main main main'
      '. . main main main main';
    overflow: auto;
  }
}
</style>
