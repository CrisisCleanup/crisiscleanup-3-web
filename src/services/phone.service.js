import AgentLibrary from 'cf-agent-library';
import store from '@/store';
import Logger from '@/utils/log';
import User from '@/models/User';
import Incident from '@/models/Incident';
import { CallType } from '@/models/phone/Contact';

const LANGUAGE_ID_MAPPING = {
  2: process.env.VUE_APP_ENGLISH_PHONE_GATEWAY,
  6: process.env.VUE_APP_SPANISH_PHONE_GATEWAY,
  7: process.env.VUE_APP_SPANISH_PHONE_GATEWAY,
  76: process.env.VUE_APP_SPANISH_PHONE_GATEWAY,
};

const Log = Logger({
  name: 'phoneLegacy',
});
export default class PhoneService {
  constructor() {
    this.store = store;
    this.loggedInAgentId = null;
    this.callInfo = {};
  }

  initPhoneService(accessToken = null) {
    this.queueIds = Array.from(
      new Set([
        process.env.VUE_APP_ENGLISH_PHONE_GATEWAY,
        process.env.VUE_APP_SPANISH_PHONE_GATEWAY,
      ]),
    );
    let socketDest;
    if (accessToken && this.agent_id) {
      socketDest = `wss://c01-con.vacd.biz:8080/?access_token=${accessToken}&agent_id=${this.agent_id}`;
    } else {
      socketDest = `wss://c01-con.vacd.biz:8080/`;
    }
    this.cf = new AgentLibrary({
      // Caution, this is prod
      socketDest, // 'ws://d01-test.cf.dev:8080',
      callbacks: {
        closeResponse: this.onCloseFunction.bind(this),
        openResponse: this.onOpenFunction,
        newCallNotification: this.onNewCall.bind(this),
        addSessionNotification: this.onNewSession.bind(this),
        endCallNotification: this.endCallFunction.bind(this),
        // agentStats: this.onGetStatsAgent.bind(this),
        agentDailyStats: this.onGetStatsAgentDaily.bind(this),
        queueStats: this.onQueueStats.bind(this),
      },
    });
  }

  async apiLogoutAgent(agentId) {
    await window.vue.$http.post(
      `${process.env.VUE_APP_API_BASE_URL}/connect_first/agents/${agentId}/logout`,
      {},
    );
  }

  async apiUpdateStats(agentId) {
    await window.vue.$http.post(
      `${process.env.VUE_APP_API_BASE_URL}/connect_first/agents/${agentId}/update_stats`,
      {},
    );
  }

  async apiGetQueueStats() {
    return window.vue.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/connect_first/stats`,
    );
  }

  async apiLoginsByPhone(phone, queue) {
    return window.vue.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/connect_first/agents/logins?phone=${phone}&queue=${queue}`,
    );
  }

  async createAgent() {
    await window.vue.$http.post(
      `${process.env.VUE_APP_API_BASE_URL}/connect_first/agents`,
      {},
    );
  }

  async getUserNameForAgent(agentId) {
    try {
      const response = await window.vue.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/connect_first/agents/${agentId}`,
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
  }

  async onNewCall(info) {
    Log.debug('callinfo: ', info);
    const currentUser = User.find(this.store.getters['auth/userId']);
    this.callInfo = info;
    let state = null;
    if (info.callType === 'INBOUND') {
      state = 'ENGAGED-INBOUND';
      const response = await window.vue.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/phone_inbound/get_by_session_id?session_id=${info.uii}`,
      );
      this.store.commit('phone_legacy/setIncomingCall', response.data);

      const availableIncidentIds = Incident.all().map(
        (incident) => incident.id,
      );
      const incidentsToRequest = response.data.incident_id.filter((id) => {
        return !availableIncidentIds.includes(id);
      });
      try {
        await Promise.all(
          incidentsToRequest.map((id) => {
            return window.vue.$http.post(
              `${process.env.VUE_APP_API_BASE_URL}/incident_requests`,
              {
                organization: currentUser.organization.id,
                incident: id,
                temporary_access: true,
              },
            );
          }),
        );

        await Incident.api().fetchById(response.data.incident_id[0]);
        await User.api().updateUserState({
          incident: response.data.incident_id[0],
        });
        this.store.commit(
          'incident/setCurrentIncidentId',
          response.data.incident_id[0],
        );
      } catch (error) {
        Log.debug('Error requesting incident access: ', error);
      }
    } else if (info.callType === 'OUTBOUND') {
      state = 'ENGAGED-OUTBOUND';
    }

    this.store.commit('phone_legacy/setState', state);
    const dnisResponse = await window.vue.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/phone_dnis?dnis=${info.ani}&sort=-created_at&limit=1`,
    );
    const [caller] = dnisResponse.data.results;
    this.store.commit('phone_legacy/setCaller', caller);
  }

  getAccessToken() {
    const myHeaders = new Headers();
    myHeaders.append('accept', '*/*');
    myHeaders.append('accept-language', 'en-US,en;q=0.9,es;q=0.8,es-MX;q=0.7');
    myHeaders.append(
      'content-type',
      'application/x-www-form-urlencoded;charset=UTF-8',
    );

    const raw = `username=${this.username}&password=${this.password}&platformId=aws80&redirectToApp=true`;

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    return fetch(
      'https://engage.ringcentral.com/api/auth/login/agent',
      requestOptions,
    )
      .then((response) => response.json())
      .catch((error) => console.log('error', error));
  }

  onCloseFunction() {
    Log.debug('AgentLibrary closed');
    this.loggedInAgentId = null;
    this.store.commit('phone_legacy/resetState');

    this.getAccessToken().then((result) => {
      this.initPhoneService(result.accessToken);
    });
  }

  async onNewSession(info) {
    if (info.sessionType === 'AGENT') {
      if (this.store.getters['phone_legacy/getIncomingCall']) {
        this.store.commit(
          'phone_legacy/setCurrentCall',
          this.store.getters['phone_legacy/getIncomingCall'],
        );
        this.store.commit('phone_legacy/setCallType', CallType.INBOUND);
        this.store.commit('phone_legacy/setIncomingCall', null);
      } else {
        this.store.commit(
          'phone_legacy/setCurrentCall',
          this.store.getters['phone_legacy/getOutgoingCall'],
        );
        this.store.commit('phone_legacy/setOutgoingCall', null);
      }
      await Incident.api().get(
        '/incidents?fields=id,name,short_name,geofence,locations,turn_on_release,active_phone_number&limit=250&ordering=-start_at',
        {
          dataKey: 'results',
        },
      );
    }
    Log.debug(info);
  }

  onOpenFunction() {
    Log.debug('AgentLibrary open');
  }

  endCallFunction(info) {
    Log.debug(info);
    if (!info.callDts) {
      this.store.commit('phone_legacy/clearCall');
    } else {
      this.store.commit('phone_legacy/setIncomingCall', null);
      this.store.commit('phone_legacy/setOutgoingCall', null);
    }
    this.changeState('AWAY').then(() => {});
    this.apiUpdateStats(this.loggedInAgentId).catch(() => {});
  }

  onGetStatsAgent(info) {
    Log.debug(info);
  }

  onGetStatsAgentDaily(info) {
    this.store.commit('phone_legacy/setAgentStats', { ...info });
  }

  onQueueStats(info) {
    this.store.commit('phone_legacy/setGeneralStats', { ...info.totals });
    this.store.commit('phone_legacy/setGateStats', [...info.queues]);
  }

  login(
    username = process.env.VUE_APP_PHONE_DEFAULT_USERNAME,
    password = process.env.VUE_APP_PHONE_DEFAULT_PASSWORD,
    state = 'AVAILABLE',
    agentId = null,
  ) {
    this.username = username;
    this.password = password;
    this.agent_id = agentId;
    const currentUser = User.find(this.store.getters['auth/userId']);
    return new Promise((resolve, reject) => {
      if (!currentUser.mobile) {
        throw new Error(
          window.vue.$t('phoneDashboard.please_set_valid_phone_number'),
        );
      }
      this.cf.loginAgent(
        username,
        password,
        async (data) => {
          Log.debug('Logged in agent', data);
          if (data.status === 'FAILURE') {
            reject(new Error(window.vue.$t('phoneDashboard.phone_no_log_in')));
            return;
          }
          this.loggedInAgentId = data.agentSettings?.agentId;

          const queueIds = [];

          if (
            currentUser.primary_language &&
            LANGUAGE_ID_MAPPING[currentUser.primary_language]
          ) {
            queueIds.push(LANGUAGE_ID_MAPPING[currentUser.primary_language]);
          }

          if (
            currentUser.secondary_language &&
            LANGUAGE_ID_MAPPING[currentUser.secondary_language]
          ) {
            queueIds.push(LANGUAGE_ID_MAPPING[currentUser.secondary_language]);
          }

          this.cf.configureAgent(
            currentUser.mobile,
            queueIds,
            null,
            null,
            null,
            null,
            (configureResponse) => {
              Log.debug('Configure response', configureResponse);
              if (configureResponse.status === 'FAILURE') {
                if (
                  configureResponse.detail.includes(
                    'Active agent session found',
                  )
                ) {
                  Log.debug('Existing login found. Setting status');
                  this.apiLogoutAgent(this.loggedInAgentId).then(() => {
                    this.loggedInAgentId = null;
                    reject();
                  });
                } else {
                  this.logout(data.agentSettings.agentId);
                  reject();
                }
              } else {
                Log.debug('AgentLibrary successfully logged in');
                this.changeState(state)
                  .then(() => resolve())
                  .catch(() => reject());
              }
            },
          );
        },
        (e) => {
          reject(e);
          Log.debug(e);
        },
      );
    });
  }

  logout(agentId = null) {
    return new Promise((resolve) => {
      this.cf.logoutAgent(agentId || this.loggedInAgentId, (data) => {
        Log.debug('logged out agent', data);
        this.store.commit('phone_legacy/setState', 'AWAY');
        resolve();
      });
    });
  }

  changeState(newState) {
    return new Promise((resolve) => {
      let state = newState;
      this.cf.setAgentState(newState, null, (setAgentStateResponse) => {
        if (setAgentStateResponse.currentState === 'ENGAGED') {
          if (this.callInfo.callType === 'INBOUND') {
            state = 'ENGAGED-INBOUND';
          } else if (this.callInfo.callType === 'OUTBOUND') {
            state = 'ENGAGED-OUTBOUND';
          }
        } else {
          state = setAgentStateResponse.currentState;
        }

        this.store.commit('phone_legacy/setState', state);
        window.vue.$log.debug(
          'Set agent state response',
          setAgentStateResponse,
        );
        resolve();
      });
    });
  }

  dial(destination, callerId = null) {
    return new Promise((resolve) => {
      this.cf.offhookInit((offhookInitResponse) => {
        Log.debug('Offhook init response', offhookInitResponse);
        if (offhookInitResponse.status === 'FAILURE') {
          this.store.commit('phone_legacy/setState', 'ENDED');
          this.store.commit('phone_legacy/setIncomingCall', null);
          this.store.commit('phone_legacy/setOutgoingCall', null);
          this.callInfo = {};
          resolve();
        } else {
          this.cf.manualOutdial(
            destination,
            callerId || process.env.VUE_APP_DEFAULT_CALLER_ID,
          );
          resolve();
        }
      });
    });
  }

  hangup() {
    return new Promise((resolve) => {
      this.cf.hangup(this.callInfo.sessionId);
      // TODO: inbound calls are not handling this hangup function correctly, I suspect we need to handle offhookTerm differently!
      Log.debug(this.store.callstate);
      this.cf.offhookTerm((offhookTermResponse) => {
        Log.debug('Offhook term response', offhookTermResponse);
        this.changeState('AWAY').then(() => resolve());
      });
    });
  }
}
