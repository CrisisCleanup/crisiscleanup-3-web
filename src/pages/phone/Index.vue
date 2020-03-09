<template>
  <Loader :loading="loading" class="h-full overflow-auto py-4 px-6 bg-gray-100">
    <template #content>
      <div class="flex">
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
      <div
        class="my-2 mx-3 bg-white shadow w-80 h-auto content-center flex-wrap "
      >
        <stories-card />
      </div>
    </template>
  </Loader>
</template>

<script>
import User from '@/models/User';
import { mapActions, mapState } from 'vuex';
import Loader from '@/components/Loader';
import PeopleStoriesCard from '@/components/PeopleStoriesCard';
import ContactCard from '@/components/ContactCard';
import genstatscard from '@/components/GeneralStatsCard.vue';
import operatorstats from '@/components/OperatorStatisticsCard';

export default {
  name: 'Phone',
  components: {
    'stories-card': PeopleStoriesCard,
    genstatscard,
    operatorstats,
    'contact-card': ContactCard,
    Loader,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    ...mapState('phone', ['agent', 'metrics']),
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
  },
  async mounted() {
    this.loading = true;
    const agentId = this.$store.getters['phone/agentId'];
    if (agentId === null) {
      this.$log.info('fetching user phone agent...');
      await this.getAgent();
    }
    await this.getRealtimeMetrics();
    this.loading = false;
  },
};
</script>
