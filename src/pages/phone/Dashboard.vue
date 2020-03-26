<template>
  <Loader :loading="loading" class="h-full overflow-auto py-4 px-6 bg-gray-100">
    <template #content>
      <div class="flex flex-row justify-between">
        <!-- Left Column -->
        <div class="flex flex-col w-1/3">
          <!-- Contact Card -->
          <div
            class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
          >
            <contact-card
              :name="currentUser.full_name"
              :mobile="currentUser.mobile"
              :profile-src="currentUser.profilePictureUrl"
              :available="agentAvailable"
              :on-toggle="toggleAvailable"
            />
          </div>
          <!-- Agent Analytics Card -->
          <div
            class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
          >
            <AgentAnalyticsCard />
          </div>
          <!-- Stats Cards -->
          <div
            class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
          >
            <genstatscard :stats="metrics ? metrics : null" />
          </div>
        </div>
        <!-- Second Column -->
        <div class="flex=col justify-between">
          <!-- Graph PLZ ADD IT-->
          <div class="flex flex-row w-full justify-between">
            <!-- Leaderboard -->
            <div
              class="my-4 mx-3 bg-white shadow w-2/3 h-auto content-center flex-wrap "
            >
              <Leaderboard />
            </div>
            <!-- News / Training Card -->
            <div class="flex-col">
              <div
                class="my-4 mx-3 bg-white shadow  h-auto content-center flex-wrap "
              >
                <training-card />
              </div>
            </div>
          </div>
          <div class="flex flex-row justify-between">
            <!-- Stories Card -->
            <div
              class="my-2 mx-3 bg-white shadow w-80 h-auto content-center flex-wrap "
            >
              <stories-card />
            </div>
          </div>
        </div>
      </div>
      <!--  -->
      <div
        class="my-4 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
      >
        <operatorstats />
      </div>
      <cc-popup :is-showing-modal="callPopupActive" />
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
import ConnectCallPopUp from '@/components/phone/ConnectCallPopUp.vue';
import Leaderboard from '@/components/phone/Leaderboard.vue';
import { STATES as CCState } from '@/services/acs.service';

export default {
  name: 'Phone',
  components: {
    genstatscard,
    operatorstats,
    'contact-card': ContactCard,
    'stories-card': PeopleStoriesCard,
    'training-card': NewsTrainingCard,
    Loader,
    'cc-popup': ConnectCallPopUp,
    AgentAnalyticsCard,
    Leaderboard,
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
    ...mapGetters('phone', ['connectReady', 'agentAvailable', 'contactState']),
    callPopupActive() {
      return [CCState.INCOMING, CCState.CONNECTING].includes(this.contactState);
    },
  },
  methods: {
    ...mapActions('phone', ['getRealtimeMetrics', 'setAgentState']),
    async toggleAvailable() {
      if (this.agentAvailable) {
        return this.setAgentState(CCState.OFFLINE);
      }
      return this.setAgentState(CCState.ROUTABLE);
    },
  },
};
</script>
