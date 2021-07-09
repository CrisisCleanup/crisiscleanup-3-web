<template>
  <div class="p-3 h-full flex flex-col items-center">
    <div class="main-grid">
      <div>
        <div class="border shadow flex flex-col mb-5">
          <div class="px-3 pt-3 flex justify-between">
            <div>Call State: {{ callState }}</div>
            <ccu-icon
              @click.native="() => (editCardActive = !editCardActive)"
              size="sm"
              type="edit"
            />
          </div>
          <div class="flex items-start justify-start px-3 pt-2 pb-4">
            <div class="w-20">
              <img
                class="rounded-full p-1 profile-image"
                :src="currentUser.profilePictureUrl"
                :alt="$t('profileUser.profile_picture')"
              />
            </div>
            <div class="mt-2 mx-2">
              <base-text variant="h2">{{ currentUser.full_name }}</base-text>
              <base-text>{{ currentUser.mobile }}</base-text>
            </div>
          </div>
          <hr />
          <div class="p-3">
            <div class="flex flex-row tags">
              <div class="w-20 text-crisiscleanup-dark-200">
                {{ $t('phoneDashboard.languages') }}
              </div>
              <div
                v-for="l in languages"
                :key="`l_${l}`"
                class="flex flex-col px-1 tag-container"
              >
                <tag class="tag-item">{{ l }}</tag>
              </div>
            </div>
          </div>
          <div class="p-3 flex justify-between items-center">
            <base-button
              v-if="!isTakingCalls"
              variant="solid"
              size="medium"
              :action="login"
              :text="$t('phoneDashboard.take_call')"
              class="flex-grow mr-4"
            ></base-button>
            <base-button
              v-else-if="!isOnCall"
              variant="solid"
              size="medium"
              :action="logout"
              :text="$t('phoneDashboard.stop_call')"
              class="flex-grow mr-4"
            ></base-button>
            <base-button
              v-else-if="isOnCall"
              size="medium"
              :disabled="true"
              :text="$t('phoneDashboard.on_call')"
              class="flex-grow mr-4 text-white bg-crisiscleanup-light-grey"
            ></base-button>
            <ccu-icon
              @click.native="() => {}"
              size="lg"
              type="dialer"
            ></ccu-icon>
          </div>
        </div>
        <div class="border shadow flex flex-col mb-5">
          <base-text class="p-3" variant="h3">{{
            $t('phoneDashboard.general_statistics')
          }}</base-text>
          <hr />
          <div class="flex flex-col bg-crisiscleanup-light-grey">
            <div class="flex p-2 items-center justify-between">
              <base-text>{{ $t('phoneDashboard.on_phone_now') }}</base-text>
              {{ stats.active || 0 }}
            </div>
            <div class="flex p-2 items-center justify-between">
              <base-text>{{
                $t('phoneDashboard.remaining_callbacks')
              }}</base-text>
              {{ remainingCallbacks }}
            </div>
            <div class="flex p-2 items-center justify-between">
              <base-text>{{
                $t('phoneDashboard.remaining_calldowns')
              }}</base-text>
              0
            </div>
            <div class="flex p-2 items-center justify-between">
              <ccu-icon with-text type="phone-plus" size="xl">
                <base-text>{{
                  $t('phoneDashboard.total_people_waiting')
                }}</base-text>
              </ccu-icon>
              {{ stats.inQueue || 0 }}
            </div>
          </div>
        </div>
        <div class="border shadow flex flex-col">
          <base-text class="p-3" variant="h3">{{
            $t('phoneDashboard.my_statistics')
          }}</base-text>
          <hr />
          <div>
            <div class="flex flex-col">
              <div class="flex p-2 items-center justify-between">
                <base-text>{{
                  $t('phoneDashboard.my_inbound_count')
                }}</base-text>
                {{ agentStats.agentStats || 0 }}
              </div>
              <div class="flex p-2 items-center justify-between">
                <base-text>{{
                  $t('phoneDashboard.my_outbound_count')
                }}</base-text>
                {{ agentStats.totalManualDials || 0 }}
              </div>
              <div class="flex p-2 items-center justify-between">
                <base-text>{{
                  $t('phoneDashboard.total_login_time')
                }}</base-text>
                {{ agentStats.totalLoginTime || 0 }}
              </div>
              <div class="flex p-2 items-center justify-between">
                <base-text>{{
                  $t('phoneDashboard.total_call_time')
                }}</base-text>
                {{ agentStats.totalTalkTime || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <tabs class="border shadow pt-1" ref="tabs">
          <tab name="phoneDashboard.next_call" ref="nextCallTab">
            <div
              class="p-2 flex flex-col"
              v-if="nextOutbound && isTakingCalls && !isOnCall"
            >
              <base-text variant="h1">
                {{ nextOutbound && nextOutbound.phone_number }}
              </base-text>
              <div class="flex py-2">
                <div class="pr-2" v-for="c in cards" :key="`${c.id}`">
                  <div
                    class="cursor-pointer bg-crisiscleanup-light-grey p-2 w-40"
                    @click="() => setCase(c)"
                    :class="c.id === caseId ? 'border' : ''"
                  >
                    <div class="flex">
                      <div
                        v-html="getSVG(c.worktype)"
                        class="cases-svg-container p-1"
                      ></div>
                      <div class="p-1">{{ c.caseNumber }}</div>
                    </div>
                    <div class="text-xs text-crisiscleanup-dark-200 p-1">
                      {{ c.address }} {{ c.state }}
                    </div>
                  </div>
                </div>
              </div>
              <base-button
                size="medium"
                variant="solid"
                :action="callOutbound"
                class="flex-shrink"
              >
                {{ $t('phoneDashboard.call') }}
              </base-button>
            </div>
            <div class="p2" v-else-if="!isTakingCalls">
              {{ $t('phoneDashboard.start_taking_calls_to_see') }}
            </div>
            <div class="p2" v-else-if="isOnCall">
              {{ $t('phoneDashboard.call_in_progress') }}
            </div>
            <div class="p2" v-else>
              {{ $t('phoneDashboard.no_user_in_inbound_queue') }}
            </div>
          </tab>
          <tab name="phoneDashboard.current_call" ref="currentCallTab">
            <div v-if="caller">
              <div class="flex items-center justify-between">
                <div>
                  <base-text variant="h3" weight="300" v-if="isOnCall">
                    {{
                      isInboundCall
                        ? $t('phoneDashboard.inbound_call_in_progress')
                        : $t('phoneDashboard.outbound_call_in_progress')
                    }}
                  </base-text>
                  <base-text variant="h3" weight="300" v-else>
                    {{ $t('phoneDashboard.call_completed') }}
                  </base-text>
                  <base-text variant="h2">
                    {{ caller.dnis }}
                  </base-text>
                  <div class="text-xs text-crisiscleanup-dark-200">
                    {{
                      `${caller.number_of_inbound_calls} ${$t(
                        ' phoneDashboard.calls ',
                      )} |${$moment(caller.created_at).diff(
                        $moment(),
                        'days',
                      )} days`
                    }}
                  </div>
                </div>
                <div>
                  <ccu-icon
                    @click.native="$phoneService.hangup"
                    v-if="isOnCall && isOutboundCall"
                    size="lg"
                    type="hangup"
                  ></ccu-icon>
                </div>
              </div>
              <div class="flex py-2" v-if="cards.length && isOutboundCall">
                <div class="pr-2" v-for="c in cards" :key="`${c.id}`">
                  <div
                    class="cursor-pointer bg-crisiscleanup-light-grey p-2 w-40"
                    @click="() => setCase(c)"
                    :class="c.id === caseId ? 'border' : ''"
                  >
                    <div class="flex">
                      <div
                        v-html="getSVG(c.worktype)"
                        class="cases-svg-container p-1"
                      ></div>
                      <div class="p-1">{{ c.caseNumber }}</div>
                    </div>
                    <div class="text-xs text-crisiscleanup-dark-200 p-1">
                      {{ c.address }} {{ c.state }}
                    </div>
                  </div>
                </div>
              </div>
              <form>
                <form-select
                  class="select"
                  :options="selectValues"
                  item-key="value"
                  label="name_t"
                  :value="status"
                  @input="updateStatus"
                  :placeholder="$t('phoneDashboard.call_status')"
                  required
                  select-classes="border border-crisiscleanup-dark-100"
                />
                <textarea
                  :value="callNotes"
                  rows="3"
                  class="
                    text-base
                    border border-crisiscleanup-dark-100
                    placeholder-crisiscleanup-dark-200
                    outline-none
                    p-2
                    my-2
                    resize-none
                    w-full
                  "
                  :placeholder="$t('phoneDashboard.notes')"
                  @input="updateNotes"
                  required
                ></textarea>
                <base-button
                  class="self-end"
                  size="small"
                  variant="solid"
                  :action="completeCall"
                >
                  {{ $t('phoneDashboard.call_complete_next_call') }}
                </base-button>
              </form>
            </div>
            <div class="p2" v-else>
              {{ $t('phoneDashboard.no_current_call') }}
            </div>
          </tab>
        </tabs>
      </div>
      <div>
        <case-form
          ref="worksiteForm"
          :incident-id="String(currentIncidentId)"
          :pda-id="currentType === 'pda' ? caseId : null"
          :worksite-id="currentType === 'worksite' ? caseId : null"
          :key="caseId"
          disable-claim-and-save
          :data-prefill="prefillData"
          :is-editing="currentType === 'worksite'"
          @savedWorksite="clearCase"
          @closeWorksite="clearCase"
          class="border shadow"
          style="grid-template-rows: 600px 80px"
          @navigateToWorksite="
            (id) => {
              currentType = 'worksite';
              caseId = id;
            }
          "
        />
      </div>
    </div>
    <EditCallerID
      :active="editCardActive"
      :request="{ phone: true, lang: true }"
      @user-updated="() => (editCardActive = false)"
    />
    <modal
      v-if="incomingCall && caller"
      :title="$t('phoneDashboard.incoming_call')"
      modal-classes="max-w-md"
    >
      <div>
        <div class="px-3 py-1">
          <div class="modal-script">
            <base-text variant="body" class="script">
              {{ $t('phoneDashboard.incoming_call_msg') }}
            </base-text>
            <base-text variant="body" class="script">
              {{
                $t('phoneDashboard.inbound_script_example', {
                  firstName: currentUser.first_name,
                })
              }}
            </base-text>
          </div>
        </div>
        <div class="flex items-center">
          <base-text class="px-3 py-1" variant="h2">
            {{ caller.dnis }}
          </base-text>
          <tag class="tag">
            <div class="text-xs">
              {{
                `${caller.number_of_inbound_calls} ${$t(
                  ' phoneDashboard.calls ',
                )} | ${$moment(caller.created_at).diff($moment(), 'days')} days`
              }}
            </div>
          </tag>
        </div>
      </div>
      <div slot="footer"></div>
    </modal>
    <modal
      v-if="outgoingCall && caller"
      @close="
        () => {
          setCaller(null);
        }
      "
      :title="$t('phoneDashboard.outbound_call')"
      modal-classes="max-w-md"
    >
      <div>
        <div class="px-3 py-1">
          {{ $t('phoneDashboard.please_wait_connect') }}
        </div>
        <div class="flex items-center">
          <base-text class="px-3 py-1" variant="h2">
            {{ caller.dnis }}
          </base-text>
          <tag class="tag">
            <div class="text-xs">
              {{
                `${caller.number_of_inbound_calls} ${$t(
                  ' phoneDashboard.calls ',
                )} | ${$moment(caller.created_at).diff($moment(), 'days')} days`
              }}
            </div>
          </tag>
        </div>
        <div v-if="cards.length">
          <div class="text-xs bg-crisiscleanup-light-grey py-1 px-3">
            {{ cards.length }} {{ $t('phoneDashboard.cases_assigned_to_dnis') }}
          </div>
          <div class="pr-2" v-for="c in cards" :key="`${c.id}`">
            <div class="p-2">
              <div class="flex items-center">
                <div
                  v-html="getSVG(c.worktype)"
                  class="cases-svg-container p-1"
                ></div>
                <div class="p-1">
                  <div>{{ c.caseNumber }}</div>
                  <div>{{ c.address }} {{ c.state }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer"></div>
    </modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import PhoneOutbound from '@/models/PhoneOutbound';
import PhoneStatus from '@/models/PhoneStatus';
import Worksite from '@/models/Worksite';
import User from '@/models/User';
import Pda from '@/models/Pda';
import { WorksitesMixin, DialogsMixin } from '@/mixins';
import Logger from '@/utils/log';
import { parsePhoneNumber } from 'libphonenumber-js';
import CaseForm from '../CaseForm';
import EditCallerID from '../../components/phone/CallerIDEditCard';
import { getErrorMessage } from '../../utils/errors';

const Log = Logger({
  name: 'connectFirstIntegration',
  middlewares: [
    (result) => {
      result.unshift('[phoneLegacy] ');
      return result;
    },
  ],
});

export default {
  name: 'ConnectFirstIntegration',
  components: { EditCallerID, CaseForm },
  mixins: [WorksitesMixin, DialogsMixin],
  async mounted() {
    this.remainingCallbacks =
      await PhoneOutbound.api().getRemainingCallbackCount(
        this.currentIncidentId,
      );
    await this.logoutByPhoneNumber();
  },
  data() {
    return {
      nextOutbound: null,
      worksite: null,
      cases: {},
      cards: [],
      caseId: null,
      currentType: null,
      status: null,
      iframeLoading: true,
      socket: null,
      currentCall: null,
      editCardActive: false,
      remainingCallbacks: 0,
      callNotes: '',
    };
  },
  methods: {
    ...mapMutations('phone_legacy', [
      'setOutgoingCall',
      'setIncomingCall',
      'setCaller',
      'setState',
    ]),
    async getUserNameForAgent(agentId) {
      try {
        const response = await this.$http.get(
          `https://frronrxz66.execute-api.us-east-1.amazonaws.com/dev/api/connectfirst/agent/${agentId}`,
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
    async login() {
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

      await this.logout();
      let username = process.env.VUE_APP_PHONE_DEFAULT_USERNAME;
      const { currentAgentId } = this.currentUser.states;
      if (currentAgentId) {
        username = await this.getUserNameForAgent(currentAgentId);
      }
      try {
        await this.$phoneService.login(username);
      } catch (e) {
        this.logout(true);
        await this.$toasted.error(
          this.$t('phoneDashboard.phone_system_login_error'),
        );
        throw e; // Rethrow for sentry
      }
      Log.debug(`Logged in agents ${username}`);
      await this.getNextCall();
    },
    async logout(clearAgent = false) {
      this.$phoneService.changeState('AWAY');
      const { loggedInAgents } = this.currentUser.states;
      if (loggedInAgents && loggedInAgents.length) {
        await Promise.all(
          loggedInAgents.map((agentId) => this.$phoneService.logout(agentId)),
        );
        Log.debug(`Logged out agents ${loggedInAgents}`);
        const stateUpdate = {
          loggedInAgents: [],
        };
        if (clearAgent) {
          stateUpdate.currentAgentId = null;
        }
        await User.api().updateUserState(stateUpdate, null, true);
      }
    },
    async callOutbound() {
      const dnisResponse = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/phone_dnis?dnis__contains=${this.nextOutbound.phone_number}&sort=-created_at&limit=1`,
      );
      const [caller] = dnisResponse.data.results;
      this.setOutgoingCall(this.nextOutbound);
      this.setCaller(caller);
      await this.$phoneService.dial(this.nextOutbound.phone_number);
    },
    setCase(caseObject) {
      this.caseId = caseObject.id;
      this.currentType = caseObject.type;
    },
    clearCase() {
      this.caseId = null;
      this.currentType = null;
    },
    async getNextCall() {
      try {
        // Not serving outbounds here for now
        // this.nextOutbound = await PhoneOutbound.api().getNextOutbound({
        //   incidentId: this.currentIncidentId,
        // });
        this.nextOutbound = null;
      } catch (e) {
        this.nextOutbound = null;
      }
      await this.createCards();
      this.$refs.tabs.selectTab(this.$refs.nextCallTab);
      this.setOutgoingCall(null);
      this.setIncomingCall(null);
      this.setCaller(null);
      this.status = null;
      this.caseId = null;
      this.currentType = null;
    },
    getSVG(worktype) {
      return this.getWorktypeSVG(worktype);
    },
    async createCards() {
      if (this.nextOutbound) {
        let cases = [];
        const { pda, worksite } = this.nextOutbound;
        if (worksite) {
          const worksiteResponse = await Worksite.api().fetch(worksite);
          const [site] = await worksiteResponse.entities.worksites;
          cases = [...Array.from([site]), ...cases];
        }
        if (pda) {
          const pdaResponse = await Pda.api().get(`/pdas/${pda}`);
          const [assessment] = await pdaResponse.entities.pdas;
          cases = [...Array.from([assessment]), ...cases];
        }
        this.cards = cases.map((c) => ({
          caseNumber: c.case_number ? c.case_number : `PDA-${c.id}`,
          address: c.short_address,
          state: c.state,
          worktype: c.getWorkType ? c.getWorkType() : 'wellness_check',
          fullAddress: c.full_address,
          id: c.id,
          type: c.case_number ? 'worksite' : 'pda',
        }));
      }
    },
    async updateStatus(statusId) {
      this.status = statusId;
    },
    async updateNotes(e) {
      this.callNotes = e.target.value;
    },
    async completeCall() {
      if (this.$refs.worksiteForm.dirtyFields.size) {
        const result = await this.$confirm({
          title: this.$t('phoneDashboard.complete_call'),
          content: this.$t('phoneDashboard.unsaved_changes_error'),
          actions: {
            no: {
              text: this.$t('actions.do_not_save'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            yes: {
              text: this.$t('actions.continue'),
              type: 'solid',
            },
          },
        });
        if (result === 'no' || result === 'cancel') {
          return;
        }
      }

      try {
        if (this.$phoneService.callInfo.callType === 'OUTBOUND') {
          await PhoneOutbound.api().updateStatus(this.call.id, {
            statusId: this.status,
            worksiteId: Boolean(this.worksite) && this.worksite.id,
            notes: this.callNotes,
          });
        }

        if (this.$phoneService.callInfo.callType === 'INBOUND') {
          await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/phone_inbound/${this.call.id}/update_status`,
            {
              status: this.status,
              notes: this.callNotes,
            },
          );
        }

        this.status = null;
        this.callNotes = '';
        await this.getNextCall();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
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
  },
  watch: {
    call(value) {
      if (value) {
        this.$refs.tabs.selectTab(this.$refs.currentCallTab);
      }
    },
  },
  computed: {
    ...mapGetters('phone_legacy', [
      'isTakingCalls',
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
    selectValues() {
      return Object.values(this.statuses).map(({ id, status_name_t }) => {
        return {
          value: id,
          name_t: status_name_t,
        };
      });
    },
    prefillData() {
      if (this.callerId) {
        return {
          phone1: this.callerId,
        };
      }
      return {};
    },
  },
};
</script>

<style scoped lang="scss">
.main-grid {
  display: grid;
  grid-template-columns: minmax(auto, 300px) 450px minmax(auto, 350px);
  grid-gap: 30px;
  height: 80vh;
}

.phone-grid {
  /*display: grid;*/
  /*grid-gap: 10px;*/
}
</style>

<style>
.cases-svg-container svg {
  width: 30px;
}
</style>
