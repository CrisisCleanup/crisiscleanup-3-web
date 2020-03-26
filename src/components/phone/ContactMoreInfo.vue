<template>
  <div>
    <!--line-->
    <hr class="bg-white" />
    <!--Info Card-->
    <div class="info">
      <div class="flex flex-col">
        <div class="justify-between flex flex-row m-3">
          <div class="flex flex-col w-1/2">
            <base-text
              variant="h4"
              weight="300"
              class="text-crisiscleanup-grey-800"
              >Languages</base-text
            >
          </div>
          <div class="flex flex-col">
            <div class="align-left">
              <div class="flex flex-row">
                <div class="flex flex-col px-2">
                  <tag
                    class="text-crisiscleanup-red-300 border-crisiscleanup-red-300"
                    >English</tag
                  >
                </div>
                <div class="flex flex-col px-2">
                  <tag
                    class="text-crisiscleanup-dark-blue border-crisiscleanup-dark-blue"
                    >Spanish</tag
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="justify-between flex flex-row m-3">
          <div class="flex flex-col w-1/2">
            <base-text
              variant="h4"
              weight="300"
              class="text-crisiscleanup-grey-800"
              >Counties</base-text
            >
          </div>
          <div class="flex flex-col w-1/2">
            <base-text variant="body">Texas, Louisiana</base-text>
          </div>
        </div>
        <div class="flex flex-row m-3">
          <div class="flex flex-col w-1/2">
            <base-text
              variant="h4"
              class="text-crisiscleanup-grey-800"
              weight="300"
              >Status</base-text
            >
          </div>
          <div class="inline-flex status w-1/2">
            <span :class="`dot ${currentState.state}`" />
            <base-text variant="body">{{ lang.status }}</base-text>
          </div>
        </div>
      </div>
    </div>
    <!--line-->
    <hr class="bg-white" />
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { mapGetters } from 'vuex';
import { STATES as CCState } from '@/services/acs.service';

export default {
  name: 'Info',
  props: {
    toggleOpen: VueTypes.bool.def(false),
  },
  computed: {
    ...mapGetters('phone', ['agentState']),
    currentState() {
      const msg = {
        state: '',
        text: '~~Offline',
      };
      switch (this.agentState) {
        case CCState.ROUTABLE:
          msg.state = 'available';
          msg.text = '~~Available';
          break;
        case CCState.ON_CALL:
        case CCState.PENDING:
          msg.state = 'oncall';
          msg.text = '~~On Call';
          break;
        case CCState.PAUSED:
          msg.state = 'paused';
          msg.text = '~~Paused';
          break;
        default:
          break;
      }
      msg.text = this.$t(msg.text);
      return msg;
    },
    lang() {
      return {
        status: this.currentState.text,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.show-btn {
  color: #f79820;
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  padding-left: 10px;
}

.status {
  align-items: center;
}

.dot {
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
</style>
