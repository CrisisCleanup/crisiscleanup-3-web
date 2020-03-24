<template>
  <Loader :loading="loading" class="h-full w-full overflow-auto">
    <template #content>
      <div
        class="gateway--container h-full w-full overflow-auto flex flex-col p-16"
      >
        <div class="step">
          <base-text class="title" variant="h1">{{ lang.title }}</base-text>
          <base-text class="text-center">{{ lang.detail }}</base-text>
        </div>
        <div v-for="s in lang.steps" :key="`step_${s.title}`" class="step">
          <base-text variant="h1">{{ s.title }}</base-text>
          <base-text>{{ s.body }}</base-text>
        </div>
        <div class="action my-6">
          <div class="input inline-flex align-items-baseline">
            <base-text variant="h2">{{ lang.action.user_id }}</base-text>
            <base-input :value="agent ? agent.user_id : ''" />
          </div>
          <div class="input inline-flex align-items-baseline">
            <base-text variant="h2">{{ lang.action.password }}</base-text>
            <base-input :value="agent ? agent.password : ''" />
          </div>
          <base-text variant="h2" class="pt-4">{{
            lang.action.title
          }}</base-text>
          <base-button variant="outline" size="large" :action="authenticate">{{
            lang.action.button
          }}</base-button>
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
        detail: this.$t('~~Maybe some more detail?'),
        steps: [
          {
            title: this.$t('~~Step 1: Open er up!'),
            body: this.$t('a more detailed explanation!'),
          },
          {
            title: this.$t('~~Step 2: Do another thing!'),
            body: this.$t('a more detailed explanation!'),
          },
          {
            title: this.$t('~~Step 3: Do another thing!'),
            body: this.$t('a more detailed explanation!'),
          },
        ],
        action: {
          title: this.$t('~~Ready?'),
          button: this.$t('~~Lets Do it!'),
          user_id: this.$t('~~Username: '),
          password: this.$t('~~Password: '),
        },
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
      console.log(agent);
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
      @apply my-8;
      display: flex;
      flex-direction: column;
      align-self: center;
      text-align: center;
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
