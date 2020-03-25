<template>
  <Loader :loading="loading" class="h-full w-full overflow-auto">
    <template #content>
      <div
        class="gateway--container h-full w-full overflow-auto flex flex-col flex items-center h-screen bg-crisiscleanup-light-grey"
      >
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mt-8">
          <div class="step">
            <base-text class="title" variant="h1">{{ lang.title }}</base-text>
            <base-text class="ml-6">{{ lang.detail }}</base-text>
          </div>
          <div v-for="s in lang.steps" :key="`step_${s.title}`" class="step">
            <base-text class="ml-6">{{ s.body }}</base-text>
          </div>
          <div class="action my-6">
            <div
              class="input inline-flex align-items-center flex items-center justify-center"
            >
              <base-text variant="h2">{{ lang.action.user_id }}</base-text>
              <base-input disabled="true" :value="agent ? agent.user_id : ''" />
            </div>
            <div class="input inline-flex align-items-baseline">
              <base-text variant="h2">{{ lang.action.password }}</base-text>
              <base-input
                disabled="true"
                :value="agent ? agent.password : ''"
              />
            </div>
            <base-text variant="h2" class="pt-4">{{
              lang.action.title
            }}</base-text>
            <base-button
              variant="solid"
              class="ml-2 p-3 px-6 text-xs"
              size="large"
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
    </template>
  </Loader>
</template>

<script>
import { EventBus } from '@/event-bus';
import Loader from '@/components/Loader.vue';
import Agent from '@/models/Agent';
import User from '@/models/User';

export default {
  name: 'PhoneGateway',
  components: {
    Loader,
  },
  data() {
    return {
      loading: true,
      agent: {},
    };
  },
  computed: {
    lang() {
      return {
        title: this.$t('~~Welcome to Crisis Cleanup Phone Center'),
        detail: this.$t(`
        ~~Before you can start taking calls, we have a temporary thing we need you to do in order to get logged into the call system.`),
        steps: [
          {
            body: this.$t(
              '~~We are going to pop up a window where you can type in the username and password.',
            ),
          },
          {
            body: this.$t(
              "~~Once you're done, you will be brought back to this page.",
            ),
          },
          {
            body: this.$t(
              '~~Grab a piece of paper and write (or copy and paste) this username and password',
            ),
          },
        ],
        action: {
          title: this.$t(''),
          button: this.$t('~~Take me to the pop-up page'),
          user_id: this.$t('~~Username: '),
          password: this.$t('~~Password: '),
        },
        linkNote: this.$t(
          '~~Note, if this does not work, copy this link and go to it in a new browser.',
        ),
      };
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
      const agent = Agent.query()
        .where('user_id', this.currentUser.id)
        .first();
      return agent;
    },
    authenticate() {
      this.loading = true;
      EventBus.$emit('acs:requestAgent');
    },
  },
  async mounted() {
    this.loading = true;
    this.agent = await this.getAgent();
    this.loading = false;
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
