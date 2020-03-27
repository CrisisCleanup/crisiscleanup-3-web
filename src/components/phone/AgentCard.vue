<template>
  <div class="agentcard shadow-xl">
    <div class="card-edit">
      <ccu-icon size="md" :type="icons.edit" />
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
          More Info
        </base-button>
      </div>
    </div>
    <div class="info-card py-3">
      <transition name="fade" mode="out-in">
        <more-info v-if="toggleOpen" />
      </transition>
    </div>
    <div class="action">
      <base-button
        :disabled="!currentState.enabled"
        :action="toggleAvailable"
        variant="solid"
        size="large"
      >
        {{ currentState.text }}
      </base-button>
    </div>
  </div>
</template>

<script>
import { IconsMixin, UserMixin, LangMixin } from '@/mixins';
import { mapActions, mapGetters } from 'vuex';
import { STATES as CCState } from '@/services/acs.service';
import ContactMoreInfo from './ContactMoreInfo.vue';

export default {
  name: 'AgentCard',
  mixins: [IconsMixin, LangMixin, UserMixin],
  components: { moreInfo: ContactMoreInfo },
  data() {
    return {
      toggleOpen: false,
    };
  },
  methods: {
    ...mapActions('phone', ['setAgentState']),
    async toggleAvailable() {
      if (this.agentAvailable) {
        return this.setAgentState(CCState.OFFLINE);
      }
      return this.setAgentState(CCState.ROUTABLE);
    },
  },
  computed: {
    ...mapGetters('phone', ['agentState', 'agentAvailable']),
    lang() {
      return this.getLang({
        start: '~~Start Taking Calls',
        ready: '~~Ready for Next Call',
        stop: '~~Stop Taking Calls',
      });
    },
    currentState() {
      const state = {
        enabled: true,
        key: 'start',
      };
      switch (this.agentState) {
        case CCState.ROUTABLE:
          state.key = 'stop';
          break;
        case CCState.PENDING:
        case CCState.ON_CALL:
        case CCState.CONNECTING:
        case CCState.CONNECTED:
          state.key = 'ready';
          state.enabled = false;
          break;
        case CCState.PAUSED:
          state.key = 'ready';
          break;
        default:
          break;
      }
      state.text = this.lang[state.key];
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
    @apply pt-6;
    display: flex;
    justify-content: center;
    align-items: bottom;
    flex-grow: 1;
  }
}
</style>
