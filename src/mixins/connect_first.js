import { mapGetters, mapMutations, mapState } from 'vuex';
import User from '@/models/User';
import PhoneStatus from '@/models/PhoneStatus';

export default {
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
      const { currentAgentId } = this.currentUser.states;
      if (currentAgentId) {
        username = await this.getUserNameForAgent(currentAgentId);
      }
      try {
        await this.$phoneService.login(username);
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
      this.$phoneService.changeState('AWAY');
      const { loggedInAgents } = this.currentUser.states;
      if (loggedInAgents && loggedInAgents.length) {
        await Promise.all(
          loggedInAgents.map((agentId) => this.$phoneService.logout(agentId)),
        );
        // Log.debug(`Logged out agents ${loggedInAgents}`);
        const stateUpdate = {
          loggedInAgents: [],
        };
        if (clearAgent) {
          stateUpdate.currentAgentId = null;
        }
        await User.api().updateUserState(stateUpdate, null, true);
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
