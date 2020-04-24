<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <home-footer />
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout, { HomeNav, HomeFooter, HomeActions } from '@/layouts/Home';
import { mapActions, mapGetters } from 'vuex';
import User from '@/models/User';

export default {
  name: 'AssignCasePage',
  components: {
    HomeLayout,
    HomeFooter,
    HomeNav,
    HomeActions,
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
