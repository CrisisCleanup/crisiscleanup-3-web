import AgentLibrary from '@/../vendor/cf-agent-library';
import store from '@/store';
import Logger from '@/utils/log';
import User from '@/models/User';

const Log = Logger({
  name: 'phoneLegacy',
  middlewares: [
    (result) => {
      result.unshift('[phoneLegacy] ');
      return result;
    },
  ],
});
export default class PhoneService {
  constructor() {
    this.store = store;
    this.cf = new AgentLibrary({
      // Caution, this is prod
      socketDest: 'wss://c01-con.vacd.biz:8080/', //'ws://d01-test.cf.dev:8080',
      callbacks: {
        closeResponse: this.onCloseFunction,
        openResponse: this.onOpenFunction,
        newCallNotification: this.onNewCall.bind(this),
        addSessionNotification: this.onNewSession.bind(this),
        endCallNotification: this.endCallFunction.bind(this),
        // agentStats: this.onGetStatsAgent.bind(this),
        agentDailyStats: this.onGetStatsAgentDaily.bind(this),
        queueStats: this.onQueueStats.bind(this),
      },
    });
    this.loggedInAgentId = null;
    this.callInfo = {};
  }

  async onNewCall(info) {
    Log.debug('callinfo: ', info);
    //need to store callInfo to get sessionId
    this.callInfo = info;
    let state = null;
    if (info.callType === 'INBOUND') {
      state = 'ENGAGED-INBOUND';
      const response = await window.vue.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/phone_inbound/get_by_session_id?session_id=${info.uii}`,
      );
      this.store.commit('phone_legacy/setIncomingCall', response.data);
    } else if (info.callType === 'OUTBOUND') {
      state = 'ENGAGED-OUTBOUND';
    }

    this.store.commit('phone_legacy/setState', state);
    const dnisResponse = await window.vue.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/phone_dnis?dnis__contains=${info.ani}&sort=-created_at&limit=1`,
    );
    const [caller] = dnisResponse.data.results;
    this.store.commit('phone_legacy/setCaller', caller);
  }

  onCloseFunction() {
    Log.debug('AgentLibrary closed');
  }

  onNewSession(info) {
    if (info.sessionType === 'AGENT') {
      if (this.store.getters['phone_legacy/getIncomingCall']) {
        this.store.commit(
          'phone_legacy/setCurrentCall',
          this.store.getters['phone_legacy/getIncomingCall'],
        );
        this.store.commit('phone_legacy/setIncomingCall', null);
      } else {
        this.store.commit(
          'phone_legacy/setCurrentCall',
          this.store.getters['phone_legacy/getOutgoingCall'],
        );
        this.store.commit('phone_legacy/setOutgoingCall', null);
      }
    }
    Log.debug(info);
  }

  onOpenFunction() {
    Log.debug('AgentLibrary open');
  }

  endCallFunction(info) {
    Log.debug(info);
    this.store.commit('phone_legacy/setState', 'ENDED');
    this.store.commit('phone_legacy/setIncomingCall', null);
    this.store.commit('phone_legacy/setOutgoingCall', null);
  }

  onGetStatsAgent(info) {
    Log.debug(info);
  }

  onGetStatsAgentDaily(info) {
    this.store.commit('phone_legacy/setAgentStats', { ...info });
  }

  onQueueStats(info) {
    this.store.commit('phone_legacy/setGeneralStats', { ...info.totals });
  }

  login(
    username = process.env.VUE_APP_PHONE_DEFAULT_USERNAME,
    password = process.env.VUE_APP_PHONE_DEFAULT_PASSWORD,
  ) {
    const currentUser = User.find(this.store.getters['auth/userId']);
    return new Promise((resolve, reject) => {
      if (!currentUser.mobile) {
        throw new Error('Please set a valid phone number to take calls');
      }
      this.cf.loginAgent(
        username,
        password,
        (data) => {
          Log.debug('Logged in agent', data);
          if (data.status === 'FAILURE') {
            throw new Error('Could not log in.');
          }
          this.loggedInAgentId = data.agentSettings.agentId;
          const loggedInAgents = currentUser.states.loggedInAgents || [];
          User.api().updateUserState(
            {
              currentAgentId: data.agentSettings.agentId,
              loggedInAgents: [...loggedInAgents, data.agentSettings.agentId],
            },
            true,
          );
          const queueIds = Array.from(
            new Set([
              process.env.VUE_APP_ENGLISH_PHONE_GATEWAY,
              process.env.VUE_APP_SPANISH_PHONE_GATEWAY,
            ]),
          );
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
                this.logout(data.agentSettings.agentId);
                reject();
              } else {
                Log.debug('AgentLibrary successfully logged in');
                this.store.commit('phone_legacy/setState', 'AVAILABLE');
                resolve();
              }
            },
          );
        },
        (e) => {
          Log.debug(e);
        },
      );
    });
  }

  logout(agentId = null) {
    return new Promise((resolve, reject) => {
      this.cf.logoutAgent(agentId || this.loggedInAgentId, (data) => {
        Log.debug('logged out agent', data);
        this.store.commit('phone_legacy/setState', 'AWAY');
        resolve();
      });
    });
  }

  changeState(newState) {
    return new Promise((resolve, reject) => {
      let state = newState;
      this.cf.setAgentState(newState, null, (setAgentStateResponse) => {
        if (
          setAgentStateResponse.previousState !==
          setAgentStateResponse.currentState
        ) {
          if (setAgentStateResponse.currentState === 'ENGAGED') {
            if (this.callInfo.callType === 'INBOUND') {
              state = 'ENGAGED-INBOUND';
            } else if (this.callInfo.callType === 'OUTBOUND') {
              state = 'ENGAGED-OUTBOUND';
            }
          } else {
            state = newState;
          }

          this.store.commit('phone_legacy/setState', state);
        }
        Log.debug('Set agent state response', setAgentStateResponse);
        resolve();
      });
    });
  }

  dial(destination) {
    return new Promise((resolve, reject) => {
      this.cf.offhookInit((offhookInitResponse) => {
        Log.debug('Offhook init response', offhookInitResponse);
        if (offhookInitResponse.status === 'FAILURE') {
          this.store.commit('phone_legacy/setState', 'ENDED');
          this.store.commit('phone_legacy/setIncomingCall', null);
          this.store.commit('phone_legacy/setOutgoingCall', null);
          this.callInfo = {};
          resolve();
        } else {
          this.cf.manualOutdial(destination, '2722003211');
          resolve();
        }
      });
    });
  }

  hangup() {
    return new Promise((resolve, reject) => {
      this.cf.hangup(this.callInfo.sessionId);
      //TODO: inbound calls are not handling this hangup function correctly, I suspect we need to handle offhookTerm differently!
      this.store.commit('phone_legacy/setState', 'AVAILABLE');
      Log.debug(this.store.callstate);
      this.cf.offhookTerm((offhookTermResponse) => {
        Log.debug('Offhook term response', offhookTermResponse);
        resolve();
      });
    });
  }
}
