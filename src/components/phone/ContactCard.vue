<template>
  <div>
    <div class="flex flex-row justify-between">
      <div class="flex-col m-3">
        <img :src="profileSrc" alt="PFP" class="rounded-full" />
      </div>
      <div class="flex-col justify-between m-3">
        <div class="flex flex-row justify-between">
          <div class="flex flex-col justify-between">
            <base-text variant="h2" class="mr-auto">{{ name }}</base-text>
          </div>
          <div class="flex-col">
            <base-button
              icon-size="md"
              size="md"
              ccu-icon="edit"
              class="hover:bg-crisiscleanup-grey-100 ml-auto"
            />
          </div>
        </div>
        <base-text variant="h2" weight="300" class="justify-between">{{
          mobile
        }}</base-text>
        <div id="moreinfobtn" class="more-infobtn">
          <base-button
            class="text-crisiscleanup-dark-blue align-right"
            :action="() => (toggleOpen = !toggleOpen)"
            >{{ !toggleOpen ? 'more' : 'less' }} info
          </base-button>
        </div>
      </div>
    </div>
    <!--- info card --->
    <div class="info-card">
      <more-info v-if="toggleOpen" />
    </div>
    <!--- Buttons --->
    <div class="flex flex-row justify-around items-center m-3">
      <div class="flex-col">
        <base-button
          class="py-2 px-12"
          size="large"
          variant="solid"
          :action="toggleAvailable"
          :disabled="!currentState.enabled"
        >
          {{ lang.action.text }}
        </base-button>
      </div>
      <div class="flex-col">
        <base-button class="hover:bg-crisiscleanup-grey-100"
          ><img src="@/assets/dialpadss.png"
        /></base-button>
      </div>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { mapGetters, mapActions } from 'vuex';
import { STATES as CCState } from '@/services/acs.service';
import ContactMoreInfo from './ContactMoreInfo.vue';

export default {
  name: 'CallerCard',
  components: {
    'more-info': ContactMoreInfo,
  },
  props: {
    name: VueTypes.string,
    mobile: VueTypes.string,
    profileSrc: VueTypes.string,
  },
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
    currentState() {
      const state = {
        text: '~~Start Taking Calls',
        enabled: true,
      };
      switch (this.agentState) {
        case CCState.ROUTABLE:
          state.text = '~~Stop Taking Calls';
          break;
        case CCState.PENDING:
        case CCState.ON_CALL:
        case CCState.CONNECTING:
        case CCState.CONNECTED:
          state.text = '~~Ready for Next Call';
          state.enabled = false;
          break;
        case CCState.PAUSED:
          state.text = '~~Ready for Next Call';
          break;
        default:
          break;
      }
      state.text = this.$t(state.text);
      return state;
    },
    lang() {
      return {
        action: {
          text: this.currentState.text,
        },
      };
    },
  },
};
</script>
