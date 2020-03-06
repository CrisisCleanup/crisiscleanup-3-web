<template>
  <div class="py-4 px-6 bg-gray-100 h-full overflow-auto relative">
    <div v-if="!loading">
      <div class="flex">
        <div
          class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
        >
          <contact-card />
        </div>
      </div>
      <div
        class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
      >
        <genstatscard />
      </div>
      <div
        class="my-4 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
      >
        <operatorstats />
      </div>
    </div>
  </div>
</template>

<script>
import User from '@/models/User';
import { mapActions, mapState } from 'vuex';
import genstatscard from '../../components/GeneralStatsCard.vue';
import operatorstats from '../../components/OperatorStatisticsCard';
import ContactCard from '../../components/ContactCard';

export default {
  name: 'Phone',
  components: { genstatscard, operatorstats, 'contact-card': ContactCard },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    ...mapState('phone', ['agent']),
  },
  methods: {
    ...mapActions('phone', ['fetchAgent']),
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
    this.loading = false;
  },
};
</script>
