<template>
  <div class="agentcard shadow-crisiscleanup-card">
    <div class="card-edit">
      <ccu-icon
        @click.native="() => (editCardActive = !editCardActive)"
        size="md"
        :type="icons.edit"
      />
    </div>
    <div class="profile">
      <div class="profile--img">
        <img
          :src="currentUser.profilePictureUrl"
          alt="UserProfile"
          class="rounded-full"
        />
      </div>
      <div class="profile--details">
        <base-text variant="h2" :weight="700">
          {{ currentUser.full_name }}
        </base-text>
        <base-text variant="h1" :weight="400">
          {{ currentUser.mobile }}
        </base-text>
        <base-button
          variant="text"
          class="more-info"
          :action="() => (toggleOpen = !toggleOpen)"
        >
          {{ toggleOpen ? lang.toggle.less : lang.toggle.more }}
        </base-button>
      </div>
    </div>
    <div class="info-card py-3">
      <transition name="fade" mode="out-in">
        <more-info v-if="toggleOpen" />
      </transition>
    </div>
    <div class="action">
      <div class="inline-flex status">
        <span :class="`dot ${currentState.state}`" />
        <base-text :weight="600" variant="body">{{
          currentState.statusText
        }}</base-text>
      </div>
      <base-button
        :disabled="!currentState.enabled"
        :action="toggleAvailable"
        variant="solid"
        size="large"
      >
        {{ currentState.text }}
      </base-button>
    </div>
    <trainings-modal
      :visible="isShowingTrainingModal"
      @onClose="isShowingTrainingModal = false"
      @onComplete="onTrainingComplete"
    ></trainings-modal>
    <agent-edit-card
      :active="editCardActive"
      :request="{ phone: true, lang: true }"
      @user-updated="() => (editCardActive = false)"
    />
    <modal
      v-if="showConnectLogin"
      modal-classes="max-w-2xl"
      @close="showConnectLogin = false"
    >
      <PhoneGateway></PhoneGateway>
    </modal>
  </div>
</template>

<script>
import { IconsMixin, UserMixin, LangMixin } from '@/mixins';
import { mapActions, mapGetters } from 'vuex';
import { STATES as CCState, EVENTS as CCEvent } from '@/services/acs.service';
import ContactMoreInfo from '@/components/phone/ContactMoreInfo.vue';
import TrainingsModal from '@/components/phone/TrainingsModal.vue';
import { EventBus } from '@/event-bus';
import CallerIDEditCard from '@/components/phone/CallerIDEditCard.vue';
import PhoneGateway from '../../pages/phone/Gateway';

export default {
  name: 'AgentCard',
  mixins: [IconsMixin, LangMixin, UserMixin],
  components: {
    PhoneGateway,
    moreInfo: ContactMoreInfo,
    'agent-edit-card': CallerIDEditCard,
    TrainingsModal,
  },
  data() {
    return {
      toggleOpen: true,
      completedTraining: false,
      isShowingTrainingModal: false,
      editCardActive: false,
      showConnectLogin: false,
    };
  },
  async mounted() {
    if (this.$cookies.isKey('training-complete')) {
      this.completedTraining = true;
    }
  },
  methods: {
    ...mapActions('phone', ['setAgentState']),
    async toggleAvailable() {
      if (!this.completedTraining) {
        this.isShowingTrainingModal = true;
        return this.isShowingTrainingModal;
      }

      if (!this.connectReady) {
        this.showConnectLogin = true;
        return this.showConnectLogin;
      }

      if (this.agentAvailable) {
        return this.setAgentState(CCState.OFFLINE);
      }
      return this.setAgentState(CCState.ROUTABLE);
    },
    async onTrainingComplete() {
      this.$cookies.set('training-complete', true);
      this.completedTraining = true;
    },
  },
  watch: {
    popupOpen(newState, oldState) {
      if (!newState && oldState && this.connectReady) {
        this.showConnectLogin = false;
        this.setAgentState(CCState.ROUTABLE);
      }
    },
  },
  computed: {
    ...mapGetters('phone', [
      'agentState',
      'agentAvailable',
      'connectReady',
      'popupOpen',
    ]),
    lang() {
      return this.getLang({
        start: '~~Start Taking Calls',
        ready: '~~Ready for Next Call',
        stop: '~~Stop Taking Calls',
        train: '~~Start Training',
        toggle: {
          more: '~~More Info',
          less: '~~Less Info',
        },
        status: {
          offline: '~~Offline',
          available: '~~Available',
          oncall: '~~On Call',
          paused: '~~Paused',
        },
      });
    },
    currentState() {
      if (!this.completedTraining) {
        return {
          enabled: true,
          text: this.lang.train,
          statusText: this.lang.status.offline,
        };
      }
      const state = {
        enabled: true,
        key: 'start',
        state: 'offline',
      };
      switch (this.agentState) {
        case CCState.POLLING:
        case CCState.ROUTABLE:
        case CCState.AGENT_CALLING:
        case CCState.AGENT_PENDING:
          state.key = 'stop';
          state.state = 'available';
          EventBus.$emit(CCEvent.AVAILABLE);
          break;
        case CCState.INCOMING:
        case CCState.BUSY:
        case CCState.CONNECTING:
          state.key = 'ready';
          state.state = 'oncall';
          state.enabled = false;
          break;
        case CCState.CONNECTED:
          state.key = 'ready';
          state.state = 'oncall';
          state.enabled = false;
          EventBus.$emit(CCEvent.ON_CALL);
          break;
        case CCState.PAUSED:
          state.key = 'ready';
          state.state = 'paused';
          EventBus.$emit(CCEvent.PAUSED);
          break;
        case CCState.OFFLINE:
        case CCState.DISCONNECTED:
          EventBus.$emit(CCEvent.OFF_CALL);
          break;
        default:
          break;
      }
      state.text = this.lang[state.key];
      state.statusText = this.lang.status[state.state];
      return state;
    },
  },
};
</script>

<style scoped lang="scss">
.agentcard {
  @apply bg-white p-3 px-6;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  /* transition: all 300ms ease; */
  .card-edit {
    display: flex;
    justify-content: flex-end;
  }
  .profile {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-grow: 1;
    &--img {
      @apply shadow-md;
      max-width: 30%;
      object-fit: contain;
      border-radius: 50%;
      position: relative;
    }
    &--details .more-info {
      @apply text-primary-dark;
      text-decoration: underline;
      &:hover {
        @apply text-primary-light;
        background-color: transparent;
      }
      .card {
        transition: 300ms ease;
      }
    }
  }
  .action {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 1;

    .status {
      align-items: center;
      @apply pb-2;
    }

    .dot {
      @apply shadow-sm;
      height: 0.75rem;
      width: 0.75rem;
      border-radius: 50%;
      display: inline-block;
      @apply mr-2 bg-crisiscleanup-red-500;
      &.available {
        @apply bg-crisiscleanup-green-300;
      }
      &.oncall {
        @apply bg-crisiscleanup-dark-blue;
      }
      &.paused {
        @apply bg-crisiscleanup-yellow-500;
      }
    }
  }
}
</style>
