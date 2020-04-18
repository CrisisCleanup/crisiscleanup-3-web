import AgentLibrary from '@/../vendor/cf-agent-library';
import store from '@/store';
import Logger from '@/utils/log';

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
    this.phone = this.store.state.phone;
    const self = this;
    this.cf = new AgentLibrary({
      // Caution, this is prod
      socketDest: 'wss://c01-con.vacd.biz:8080/', //'ws://d01-test.cf.dev:8080',
      callbacks: {
        closeResponse: this.onCloseFunction,
        openResponse: this.onOpenFunction,
        // TODO: Figure out a way to access 'self' context when put in seperate function
        newCallNotification: this.onNewCall.bind(this),
        endCallNotification: this.endCallFunction.bind(this),
      },
    });
    this.gateway = this.phone.gateway;
    this.user = this.phone.user;
    this.loggedInAgentId = null;
    this.callInfo = {};
  }

  onNewCall(info) {
    Log.debug('callinfo: ', info);
    //need to store callInfo to get sessionId
    this.callInfo = info;
    let state = null;
    if (info.callType === 'INBOUND') {
      state = 'ENGAGED-INBOUND';
    } else if (info.callType === 'OUTBOUND') {
      state = 'ENGAGED-OUTBOUND';
    }
    this.store.commit('phone_legacy/setState', state);
    return new Promise((resolve, reject) => {
      window.vue.$http
        .get(
          `${process.env.VUE_APP_API_BASE_URL}/phone_inbound/get_by_session_id?session_id=${info.uii}`,
        )
        .then((data) => {
          this.store.commit('phone_legacy/setCall', data);
          resolve(data);
        })
        .catch(() => {});
      // self.store
      //   .dispatch('phone_legacy/getCallerDetails', info.ani)
      //   .then((caller) => {
      //     // Save call info
      //     const call = {
      //       call_start: Date.now,
      //       user_number: info.dialDest,
      //       caller: caller.id,
      //       gateway: self.gateway.id,
      //       call_type: info.callType,
      //       ccu_number: info.ani, //we want to show the caller's number
      //       external_id: info.uii,
      //     };
      //     self.store.dispatch('phone_legacy/updateCall', call).then(resolve());
      //   });
    });
  }

  onCloseFunction() {
    Log.debug('AgentLibrary closed');
  }

  onOpenFunction() {
    Log.debug('AgentLibrary open');
  }

  endCallFunction(info) {
    Log.debug(info);
    this.store.commit('phone_legacy/setState', 'ENDED');
    this.store.commit('phone_legacy/setCall', {});
    this.callInfo = {};
  }

  login(
    username = 'covidtest',
    password = 'covidtest',
    phoneNumber = '2512107756',
    gatewayIds = ['124906'],
  ) {
    return new Promise((resolve, reject) => {
      Log.debug(this.gateway);

      this.cf.loginAgent(
        username,
        password,
        (data) => {
          Log.debug('Logged in agent', data);
          if (data.status === 'FAILURE') {
            throw new Error('Could not log in.');
          }
          Log.debug('AgentLibrary successfully logged in');
          this.store.commit('phone_legacy/setState', 'AVAILABLE');
          this.store.commit(
            'phone_legacy/setCurrentAgentId',
            data.agentSettings.agentId,
          );
          this.loggedInAgentId = data.agentSettings.agentId;
          this.cf.configureAgent(
            phoneNumber,
            gatewayIds,
            null,
            null,
            null,
            null,
            (configureResponse) => {
              Log.debug('Configure response', configureResponse);
              resolve();
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
        //first input = number to call, second input = number that shows up
        //TODO: remove hard-coded gateway number and used stored information
        this.cf.manualOutdial(destination, '2722003211', () => {
          resolve();
        });
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
