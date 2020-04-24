<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <div class="flex flex-col w-full">
          <!-- Header -->
          <h1 class="mb-5 text-2xl font-bold">Create New Team</h1>
          <div class="flex flex-col w-2/3 ml-3">
            <!-- team Name input -->
            <div class="my-2">
              <base-input placeholder="Team Name"></base-input>
            </div>
            <div class="flex justify-start my-2">
              <base-button variant="underline">
                <base-text variant="bodysm"
                  >+ Chooose the name for me</base-text
                >
              </base-button>
            </div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="flex flex-col w-2/3 m-3">
              <!-- Team Members -->
              <div class="flex flex-row justify-between my-2">
                <div class="flex-col">
                  <base-text
                    variant="bodysm"
                    class="text-crisiscleanup-dark-300"
                  >
                    Team Members
                  </base-text>
                </div>
                <div class="flex-col">
                  <base-button variant="underline">
                    <base-text variant="bodysm">
                      + Add team Members
                    </base-text>
                  </base-button>
                </div>
              </div>
              <!-- Cases -->
              <div class="flex flex-row justify-between my-2">
                <div class="flex-col">
                  <base-text
                    variant="bodysm"
                    class="text-crisiscleanup-dark-300"
                  >
                    Cases
                  </base-text>
                </div>
                <div class="flex-col">
                  <base-button variant="underline">
                    <base-text variant="bodysm">
                      + Assign Case to Team
                    </base-text>
                  </base-button>
                </div>
              </div>
              <!-- Assets -->
              <div class="flex flex-row justify-between my-2">
                <div class="flex-col">
                  <base-text
                    variant="bodysm"
                    class="text-crisiscleanup-dark-300"
                  >
                    Assets
                  </base-text>
                </div>
                <div class="flex-col">
                  <base-button variant="underline">
                    <base-text variant="bodysm">
                      + Add Assets
                    </base-text>
                  </base-button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex-row ml-3">
            <!-- Notes -->
            <div class="flex-col w-2/3">
              <div class="mb-2">
                <base-text variant="bodysm" class="text-crisiscleanup-dark-300">
                  Notes
                </base-text>
              </div>
              <base-input variant="underline" placeholder="text"></base-input>
            </div>
            <!-- Create New Team Button -->
            <div class="flex flex-row mt-5">
              <base-button variant="solid" class="py-3 w-2/3"
                >Create Team</base-button
              >
            </div>
          </div>
          <div class="flex flex-col" />
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

export default {
  name: 'CreateNewTeam',
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
