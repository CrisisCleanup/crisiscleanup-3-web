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
import Agent from '@/models/Agent';
import User from '@/models/User';
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
  },
  async mounted() {
    this.loading = true;
    try {
      await Agent.api().get('/agents/me', {});
    } catch {
      console.warn('CREATING AGENT');
      await Agent.api().post('/agents', {
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
        },
      });
    }
    this.loading = false;
  },
};
</script>
