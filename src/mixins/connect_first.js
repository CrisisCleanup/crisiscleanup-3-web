import { mapGetters, mapMutations, mapState } from 'vuex';
import { parsePhoneNumber } from 'libphonenumber-js';
import User from '@/models/User';
import PhoneStatus from '@/models/PhoneStatus';
import Incident from '@/models/Incident';
import PhoneOutbound from '@/models/PhoneOutbound';
import { getErrorMessage } from '@/utils/errors';
import { CallType } from '@/models/phone/Contact';
import Worksite from '@/models/Worksite';

export default {
  data() {
    return {
      currentAgent: null,
      dialing: false,
    };
  },
  async mounted() {
    const callHistoryResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/phone_agents/call_history`,
    );
    this.setCallHistory(callHistoryResponse.data);
  },
  computed: {
    ...mapGetters('phone_legacy', [
      'isTakingCalls',
      'isNotTakingCalls',
      'isOnCall',
      'isTransitioning',
      'isInboundCall',
      'isOutboundCall',
    ]),
    ...mapState('incident', ['currentIncidentId']),
    ...mapState('phone_legacy', [
      'callState',
      'callType',
      'call',
      'caller',
      'incomingCall',
      'outgoingCall',
      'stats',
      'agentStats',
      'gateStats',
      'callHistory',
    ]),
    languages() {
      return this.currentUser.languages;
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    statuses() {
      return PhoneStatus.all();
    },
    currentIncident() {
      return Incident.find(this.currentIncidentId);
    },
  },
  methods: {
    ...mapMutations('phone_legacy', [
      'setOutgoingCall',
      'setIncomingCall',
      'setCurrentCall',
      'setCaller',
      'setState',
      'setCallType',
      'setCallHistory',
      'setGeneralStats',
      'clearCall',
      'resetState',
    ]),
    ...mapMutations('incident', ['setCurrentIncidentId']),
    async loadAgent() {
      try {
        const { data } = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/phone_agents/me`,
        );
        this.currentAgent = data;
      } catch (e) {
        const { data } = await this.$phoneService.createAgent();
        this.currentAgent = data;
      }
    },
    async loginPhone(retry = true, status = 'WORKING') {
      await this.loadAgent();
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

      if (!this.$phoneService.loggedInAgentId) {
        const password = process.env.VUE_APP_PHONE_DEFAULT_PASSWORD;

        if (!this.currentAgent?.agent_username) {
          const { data } = await this.$phoneService.createAgent();
          this.currentAgent = data;
        }

        try {
          this.$phoneService.username = this.currentAgent.agent_username;
          this.$phoneService.password = password;
          this.$phoneService.agent_id = this.currentAgent.agent_id;
          if (!this.$phoneService.cf) {
            const result = await this.$phoneService.getAccessToken();
            this.$phoneService.initPhoneService(result.accessToken);
          }
          await this.$phoneService.login(
            this.currentAgent.agent_username,
            password,
            status,
            this.currentAgent.agent_id,
          );
          this.$emit('onLoggedIn');
        } catch (e) {
          this.$log.debug(e);
          if (retry) {
            await this.logoutPhone();
            await this.loginPhone(false, status);
          }
        }
      } else {
        await this.setWorking();
        this.$emit('onLoggedIn');
      }
      this.$phoneService
        .apiUpdateStats(this.$phoneService.loggedInAgentId)
        .catch(() => {});
    },
    async setAvailable() {
      return this.$phoneService.changeState('AVAILABLE');
    },
    async setWorking() {
      return this.$phoneService.changeState('WORKING');
    },
    async setAway() {
      return this.$phoneService.changeState('AWAY');
    },
    async resetPhoneSystem() {
      await this.logoutByPhoneNumber();
      this.clearCall();
    },
    async logoutPhone() {
      // await this.$phoneService.changeState('AWAY');
      const agent_id = this.currentAgent?.agent_id;
      if (agent_id) {
        await this.$phoneService.logout(agent_id);
      }
      await this.loadAgent();
    },
    async logoutByPhoneNumber() {
      const parsedNumber = parsePhoneNumber(this.currentUser.mobile, 'US');
      if (this.currentUser.mobile) {
        await Promise.all(
          this.$phoneService.queueIds.map((queueId) =>
            this.$phoneService
              .apiLoginsByPhone(
                parsedNumber.formatNational().replace(/[^\d.]/g, ''),
                queueId,
              )
              .then(async ({ data }) => {
                if (data.length) {
                  await Promise.all(
                    data.map((login) =>
                      this.$phoneService.apiLogoutAgent(login.agentId),
                    ),
                  );
                  this.$phoneService.initPhoneService();
                }
                return null;
              })
              .catch(() => {}),
          ),
        );
      }
    },
    async createOutboundCall(outbound, number) {
      const dnisResponse = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/phone_dnis/${outbound.dnis1}`,
      );
      const caller = dnisResponse.data;
      let callType = outbound.call_type.toUpperCase();
      if (callType !== 'CALLDOWN') {
        callType = CallType.OUTBOUND;
      }
      this.setCallType(callType);
      this.setOutgoingCall(outbound);
      this.setCurrentCall(outbound);
      this.setCaller(caller);
      await this.$phoneService.dial(
        number,
        this.currentIncident.active_phone_number,
      );
    },
    async dialManualOutbound(number) {
      await this.loginPhone(true, 'WORKING');
      this.dialing = true;
      try {
        const outbound = await PhoneOutbound.api().createManual({
          number,
          incidentId: this.currentIncidentId,
          userId: this.currentUser.id,
          language: this.currentUser.primary_language.id,
        });
        await this.createOutboundCall(outbound, number);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.dialing = false;
      }
    },
    async dialNextOutbound() {
      this.dialing = true;
      try {
        const outbound = await PhoneOutbound.api().getNextOutbound({
          incidentId: this.currentIncidentId,
        });
        if (outbound.worksite) {
          await Worksite.api().fetch(outbound.worksite);
        }
        await this.createOutboundCall(outbound, outbound.phone_number);
      } finally {
        this.dialing = false;
      }
    },
  },
};
