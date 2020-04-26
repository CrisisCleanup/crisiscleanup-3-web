<template>
  <Loader :loading="loading" class="h-full w-full">
    <template #content>
      <phone-layout>
        <template #grid-start>
          <div class="grid--start">
            <agent-block />
          </div>
        </template>
        <template #grid-main>
          <div class="grid--main w-auto">
            <div class="dash-grid">
              <div class="grid--leader">
                <leaderboard />
              </div>
              <div class="grid--train">
                <training-card
                  :image-path="training.imagePath"
                  :description="training.description"
                  :time-to-complete="training.timeToComplete"
                >
                </training-card>
              </div>
              <div class="grid--history">
                <CallHistory />
              </div>
            </div>
          </div>
        </template>
      </phone-layout>
      <div v-if="currentUser.isAdmin" class="contact-container">
        <ContactTable />
      </div>
    </template>
  </Loader>
</template>

<script>
import User from '@/models/User';
import { mapActions, mapGetters } from 'vuex';
import Loader from '@/components/Loader.vue';
import Leaderboard from '@/components/phone/Widgets/Leaderboard.vue';
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import CallHistory from '@/components/phone/Widgets/CallHistory.vue';
import ContactTable from '@/components/phone/Widgets/ContactTable.vue';
import NewsTrainingCard from '@/components/phone/Widgets/NewsTrainingCard.vue';

export default {
  name: 'Phone',
  components: {
    PhoneLayout,
    AgentBlock,
    Loader,
    CallHistory,
    'training-card': NewsTrainingCard,
    Leaderboard,
    ContactTable,
  },
  data() {
    return {
      loading: false,
      training: {
        imagePath: require('@/assets/newstrainingss.jpg'),
        description:
          'Then go and tempor incididunt ut labore et dolore magna aliqua.',
        timeToComplete: '10 minutes',
      },
    };
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

.phonegrid {
  &.grid-container {
    grid:
      [r1] 'start main' [r1end]
      / 1fr 3.75fr;
  }
}

.grid--main {
  .dash-grid {
    display: inline-grid;
    grid-gap: 2rem;
    width: 100%;
    @apply pr-6;
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

.contact-container {
  @apply bg-crisiscleanup-light-grey p-6;
}
</style>
