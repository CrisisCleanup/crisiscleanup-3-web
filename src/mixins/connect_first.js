import { mapGetters, mapMutations, mapState } from 'vuex';
import User from '@/models/User';
import PhoneStatus from '@/models/PhoneStatus';

export default {
  data() {
    return {
      currentAgent: null,
    };
  },
  async mounted() {
    try {
      const { data } = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/phone_agents/me`,
      );
      this.currentAgent = data;
    } catch {
      this.currentAgent = null;
    }
  },
  computed: {
    ...mapGetters('phone_legacy', [
      'isTakingCalls',
      'isNotTakingCalls',
      'isOnCall',
      'isInboundCall',
      'isOutboundCall',
    ]),
    ...mapState('incident', ['currentIncidentId']),
    ...mapState('phone_legacy', [
      'callState',
      'call',
      'caller',
      'incomingCall',
      'outgoingCall',
      'stats',
      'agentStats',
    ]),
    languages() {
      return this.currentUser.languages.map(
        ({ name_t }) => name_t.split(' ')[0],
      );
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    statuses() {
      return PhoneStatus.all();
    },
  },
  methods: {
    ...mapMutations('phone_legacy', [
      'setOutgoingCall',
      'setIncomingCall',
      'setCaller',
      'setState',
    ]),
    async loginPhone() {
      if (!this.languages.length) {
        await this.$toasted.error(
          this.$t('phoneDashboard.select_language_error'),
        );
        return;
      }

      if (!this.currentUser.mobile) {
        await this.$toasted.error(
          this.$t('phoneDashboard.add_phone_number_error'),
        );
        return;
      }

      await this.logoutPhone();
      let username = process.env.VUE_APP_PHONE_DEFAULT_USERNAME;
      const password = process.env.VUE_APP_PHONE_DEFAULT_PASSWORD;
      const agent_username = this.currentAgent?.agent_username;
      if (agent_username) {
        username = agent_username;
      }
      try {
        await this.$phoneService.login(username, password, this.currentAgent);
      } catch (e) {
        this.logoutPhone(true);
        await this.$toasted.error(
          this.$t('phoneDashboard.phone_system_login_error'),
        );
        throw e; // Rethrow for sentry
      }
      // Log.debug(`Logged in agents ${username}`);
      // await this.getNextCall();
    },
    async logoutPhone(clearAgent = false) {
      await this.$phoneService.changeState('AWAY');
      const agent_id = this.currentAgent?.agent_id;
      if (agent_id) {
        await this.$phoneService.logout(agent_id);
      }
      if (clearAgent) {
        await this.$http.patch(
          `${process.env.VUE_APP_API_BASE_URL}/phone_agents/${this.currentAgent.id}`,
          {
            agent_id: null,
            agent_username: null,
          },
        );
      }
    },
    async getUserNameForAgent(agentId) {
      try {
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/connect_first/agents/${agentId}`,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        return response.data.username;
      } catch (e) {
        await User.api().updateUserState(
          {
            currentAgentId: null,
          },
          null,
          true,
        );
        return process.env.VUE_APP_PHONE_DEFAULT_USERNAME;
      }
    },
  },
};
