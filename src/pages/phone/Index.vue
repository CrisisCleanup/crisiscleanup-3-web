<template>
  <Loader :loading="loading" class="h-full overflow-auto py-4 px-6 bg-gray-100">
    <template #content>
      <div class="flex">
        <!-- Contact Card -->
        <div
          class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
        >
          <contact-card
            :name="currentUser.full_name"
            :mobile="currentUser.mobile"
            :profile-src="currentUser.profilePictureUrl"
          />
        </div>
      </div>
      <!-- Stats Cards -->
      <div
        class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
      >
        <genstatscard :stats="metrics ? metrics : null" />
      </div>
      <div
        class="my-4 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
      >
        <operatorstats />
      </div>
      <!-- Stories Card -->
      <div
        class="my-2 mx-3 bg-white shadow w-80 h-auto content-center flex-wrap "
      >
        <stories-card />
      </div>
      <!-- Training Card -->
      <div
        class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
      >
        <training-card />
      </div>
      <!-- Agent Analytics Card -->
      <div
        class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
      >
        <AgentAnalyticsCard />
      </div>
    </template>
  </Loader>
</template>

<script>
import User from '@/models/User';
import { mapActions, mapState, mapGetters } from 'vuex';
import Loader from '@/components/Loader.vue';
import PeopleStoriesCard from '@/components/phone/PeopleStoriesCard.vue';
import ContactCard from '@/components/phone/ContactCard.vue';
import genstatscard from '@/components/phone/GeneralStatsCard.vue';
import operatorstats from '@/components/phone/OperatorStatisticsCard.vue';
import NewsTrainingCard from '@/components/phone/NewsTrainingCard.vue';
import AgentAnalyticsCard from '@/components/phone/AgentAnalyticsCard.vue';
import { EventBus } from '../../event-bus';

export default {
  name: 'Phone',
  components: {
    genstatscard,
    operatorstats,
    'contact-card': ContactCard,
    'stories-card': PeopleStoriesCard,
    'training-card': NewsTrainingCard,
    Loader,
    AgentAnalyticsCard,
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    ...mapState('phone', ['agent', 'metrics']),
    ...mapGetters('phone', ['connectReady']),
  },
  methods: {
    ...mapActions('phone', ['fetchAgent', 'getRealtimeMetrics']),
    async getAgent() {
      const userAgent = {
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
        },
      };
      await this.fetchAgent(userAgent);
    },
    async resolveAgent() {
      // await this.getAgent();
      // await this.getRealtimeMetrics();
      this.loading = false;
    },
  },
  created() {
    this.loading = true;
    if (!this.connectReady) {
      EventBus.$emit('acs:requestAgent');
      // will be called every ~1m and update the agent state and stats
      this.$store.subscribe(mutation => {
        switch (mutation.type) {
          case 'phone/setAgentState':
            Promise.resolve(this.resolveAgent());
            break;
          default:
            break;
        }
      });
    }
    this.loading = false;
  },
};
</script>
