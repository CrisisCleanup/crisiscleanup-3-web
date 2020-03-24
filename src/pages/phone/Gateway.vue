<template>
  <Loader :loading="loading" class="h-full overflow-auto">
    <template #content>
      <div class="gateway--container">
        <div class="step">
          <base-text class="title" variant="h1">{{ lang.title }}</base-text>
          <base-text>{{ lang.detail }}</base-text>
        </div>
        <div v-for="s in lang.steps" :key="`step_${s.title}`" class="step">
          <base-text variant="h1">{{ s.title }}</base-text>
          <base-text>{{ s.body }}</base-text>
        </div>
        <div class="action">
          <base-text variant="h2">{{ lang.action.title }}</base-text>
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
      loading: false,
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
        ],
        action: {
          title: this.$t('~~Ready?'),
          button: this.$t('~~Lets Do it!'),
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
.gateway {
  &--container {
    @apply h-full pb-16;
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;

    p.title {
      @apply text-3xl;
    }

    .step {
      @apply my-8;
      display: flex;
      flex-grow: 1;
      width: 80%;
      flex-direction: column;
      p {
        @apply py-2;
        &:last-child {
          text-align: center;
          align-self: center;
        }
      }
    }

    .action {
      p {
        text-align: center;
        @apply pb-4;
      }
      justify-self: flex-end;
    }
  }
}
</style>
