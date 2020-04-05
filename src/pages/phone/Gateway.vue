<template>
  <Loader :loading="loading" class="h-full w-full overflow-auto">
    <template #content>
      <div
        class="gateway--container h-full w-full overflow-auto flex flex-col flex items-center bg-crisiscleanup-light-grey"
      >
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mt-8">
          <div class="step">
            <base-text class="title" variant="h1">{{ lang.title }}</base-text>
            <base-text class="ml-6">{{ lang.detail }}</base-text>
          </div>
          <div v-for="(s, idx) in lang.steps" :key="`step_${idx}`" class="step">
            <base-text class="ml-6">{{ s.body }}</base-text>
          </div>
          <div class="action my-6">
            <div
              class="input inline-flex align-items-center flex items-center justify-center"
            >
              <base-text variant="h2">{{ lang.action.user_id }}</base-text>
              <base-input
                disabled="disabled"
                :value="agent ? agent.user_id : ''"
              />
              <input id="username" class="hidden" :value="agent.user_id" />
              <base-button
                variant="outline"
                class="ml-2 px-6 text-xs"
                size="medium"
                :action="() => copyText(agent.user_id)"
              >
                {{ lang.copy.button }}
              </base-button>
            </div>
            <div class="input inline-flex align-items-baseline">
              <base-text variant="h2">{{ lang.action.password }}</base-text>
              <base-input
                disabled="disabled"
                :value="agent ? agent.password : ''"
              />
              <input id="password" class="hidden" :value="agent.password" />
              <base-button
                variant="outline"
                class="ml-2 px-6 text-xs"
                size="medium"
                :action="() => copyText(agent.password)"
              >
                {{ lang.copy.button }}
              </base-button>
            </div>
            <base-text variant="h2" class="pt-4">{{
              lang.action.title
            }}</base-text>
            <base-button
              variant="solid"
              class="ml-2 p-3 px-6 text-xs"
              size="large"
              :show-spinner="popupOpen"
              :action="authenticate"
            >
              {{ lang.action.button }}
            </base-button>
          </div>
          <div class="step">
            <base-text class="ml-6">{{ lang.linkNote }}</base-text>
          </div>
        </div>
      </div>
      <caller-edit-card
        :active="!agentValid"
        :request="agentNeeded"
        @user-updated="() => validateAgent()"
      />
    </template>
  </Loader>
</template>

<script>
import { EventBus } from '@/event-bus';
import Loader from '@/components/Loader.vue';
import Agent, { ERRORS as AgentErrors } from '@/models/Agent';
import User from '@/models/User';
import { mapGetters } from 'vuex';
import CallerEditCard from '@/components/phone/CallerIDEditCard.vue';
import { LangMixin } from '@/mixins';

export default {
  name: 'PhoneGateway',
  mixins: [LangMixin],
  components: {
    Loader,
    CallerEditCard,
  },
  data() {
    return {
      loading: true,
      disabled: false,
      agentValid: true,
      agentNeeded: {
        phone: false,
        lang: false,
      },
      agent: {},
    };
  },
  computed: {
    ...mapGetters('phone', ['popupOpen']),
    lang() {
      return this.getLang({
        title: '~~Welcome to Crisis Cleanup Phone Center',
        detail: `
        ~~Before you can start taking calls, we have a temporary thing we need you to do in order to get logged into the call system.`,
        steps: [
          {
            body:
              '~~We are going to pop up a window where you can type in the username and password.',
          },
          {
            body: "~~Once you're done, you will be brought back to this page.",
          },
          {
            body:
              '~~Grab a piece of paper and write (or copy and paste) this username and password',
          },
        ],
        action: {
          button: '~~Take me to the pop-up page',
          user_id: '~~Username: ',
          password: '~~Password: ',
        },
        copy: {
          button: '~~Copy',
          successMessage: '~~Copied!',
        },
        linkNote:
          '~~Note, if this does not work, copy this link and go to it in a new browser.',
      });
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  methods: {
    async getAgent() {
      const userAgent = {
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
        },
      };
      await Agent.api().fetch(userAgent);
      const agent = Agent.query().where('user_id', this.currentUser.id).first();
      return agent;
    },
    async validateAgent() {
      this.loading = true;
      this.agentValid = true;
      this.agentNeeded.phone = false;
      this.agentNeeded.lang = false;
      try {
        this.agent = await this.getAgent();
      } catch (errs) {
        const {
          MOBILE_INVALID,
          MOBILE_NOT_FOUND,
          LANGUAGE_NOT_FOUND,
          LANGUAGE_NOT_SUPPORTED,
        } = AgentErrors;
        const invalidPhone = (el) =>
          [MOBILE_INVALID, MOBILE_NOT_FOUND].includes(el);
        const invalidLang = (el) =>
          [LANGUAGE_NOT_FOUND, LANGUAGE_NOT_SUPPORTED].includes(el);
        this.agentValid = false;
        if (errs.some(invalidPhone)) {
          this.agentNeeded.phone = true;
        }
        if (errs.some(invalidLang)) {
          this.agentNeeded.lang = true;
        }
      }
      this.loading = false;
    },
    authenticate() {
      EventBus.$emit('acs:requestAgent');
    },
    async copyText(text) {
      await this.$copyText(text);
      this.$toasted.success(this.lang.copy.successMessage);
    },
  },
  async mounted() {
    await this.validateAgent();
  },
};
</script>

<style lang="scss" scoped>
div.gateway {
  &--container {
    @apply h-full w-full;
    display: flex;
    flex-direction: column;

    p.title {
      @apply text-3xl;
      text-align: center;
    }

    .step {
      display: flex;
      flex-direction: column;
      p {
        @apply py-2;
      }
    }

    .action {
      display: flex;
      flex-direction: column;
      p {
        text-align: center;
        @apply pb-4;
      }
      justify-content: center;
      align-items: center;
      .input {
        align-items: baseline;
        p {
          @apply pr-4;
        }
      }
    }
  }
}
</style>
