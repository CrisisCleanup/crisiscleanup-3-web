<template>
  <div class="agentcard shadow-crisiscleanup-card">
    <div class="card-edit">
      <ccu-icon @click.native="() => forceAgentEdit()" size="md" type="edit" />
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
        <base-text :weight="700" variant="h2">
          {{ currentUser.full_name }}
        </base-text>
        <base-text :weight="400" variant="h1">
          {{ currentUser.mobile }}
        </base-text>
        <base-button
          :action="() => showMoreState.toggle()"
          class="more-info"
          variant="text"
        >
          {{ showMoreState.state.value ? 'less' : 'more' }}
        </base-button>
      </div>
    </div>
    <div class="info-card py-3">
      <transition mode="out-in" name="fade">
        <more-info v-if="showMoreState.state.value" />
      </transition>
    </div>
    <div class="action">
      <div class="inline-flex status">
        <span :class="`dot ${agent.friendlyState}`" />
        <base-text :weight="600" variant="body"
          >{{ agentState.statusText | startCase }}
        </base-text>
      </div>
      <base-button
        :action="() => handleAgentState()"
        :disabled="!agentState.enabled"
        size="large"
        variant="solid"
      >
        {{ $t(agentState.text) }}
      </base-button>
    </div>
    <trainings-modal
      :visible="trainingState.state.value"
      @onClose="() => trainingState.toggle(false)"
      @onComplete="onTrainingComplete"
    ></trainings-modal>
    <agent-edit-card
      :active="editCardState.state.value"
      :request="validations"
      @user-updated="() => validateAgent()"
    />
  </div>
</template>

<script>
import ContactMoreInfo from '@/components/phone/ContactMoreInfo.vue';
import TrainingsModal from '@/components/phone/TrainingsModal.vue';
import CallerIDEditCard from '@/components/phone/CallerIDEditCard.vue';
import useAgentState from '@/use/phone/useAgentState';
import useAgent from '@/use/phone/useAgent';
import { reactive, onMounted } from '@vue/composition-api';
import useToggle from '@/use/useToggle';
import useUser from '@/use/user/useUser';
import useTraining from '@/use/user/useTraining';
import Agent, { ERRORS as AgentErrors } from '@/models/Agent';
import ControllerStore, {
  ControllerPages,
} from '@/store/modules/phone/controller';
import { useStore } from '@u3u/vue-hooks';
import { getModule } from 'vuex-module-decorators';
import { unwrap } from '@/utils/wrap';

const useValidations = ({ currentUser }) => {
  const editCardState = useToggle();

  const state = reactive({
    phone: false,
    lang: false,
  });

  const validateAgent = async () => {
    editCardState.toggle(false);
    state.phone = false;
    state.lang = false;
    try {
      await Agent.api().fetch({
        user: {
          id: unwrap(currentUser).id,
          email: unwrap(currentUser).email,
        },
      });
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
      editCardState.toggle(true);
      if (errs.some(invalidPhone)) {
        state.phone = true;
      }
      if (errs.some(invalidLang)) {
        state.lang = true;
      }
    }
  };

  const forceAgentEdit = () => {
    state.phone = true;
    state.lang = true;
    editCardState.toggle(true);
  };

  onMounted(async () => validateAgent());

  return {
    editCardState,
    validateAgent,
    validations: state,
    forceAgentEdit,
  };
};

export default {
  name: 'AgentCard',
  components: {
    moreInfo: ContactMoreInfo,
    'agent-edit-card': CallerIDEditCard,
    TrainingsModal,
  },
  setup(props, context) {
    const showMoreState = useToggle({ state: true });
    const store = useStore();
    const ctrlStore = getModule(ControllerStore, store.value);
    const trainingState = useToggle();

    const { allTrainingCompleted, onTrainingComplete } = useTraining({
      tests: [2, 3],
    });

    const { agent, agentState, toggleAgentState } = useAgentState({
      ...useAgent(),
      context,
      isTrained: allTrainingCompleted,
    });

    const handleAgentState = () => {
      if (ctrlStore.view === ControllerPages.CONTROLLER) {
        context.root.$toasted.error(
          context.root.$t('~~You must complete the open call to take another!'),
        );
        return;
      }
      toggleAgentState();
    };

    return {
      trainingState,
      showMoreState,
      agent,
      agentState,
      handleAgentState,
      onTrainingComplete,
      ...useUser(),
      ...useValidations({ currentUser: useUser().currentUser }),
    };
  },
};
</script>

<style lang="scss" scoped>
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
      &.online {
        @apply bg-crisiscleanup-green-300;
      }

      &.connecting {
        @apply bg-crisiscleanup-lightblue-800;
      }

      &.talking {
        @apply bg-crisiscleanup-dark-blue;
      }

      &.paused {
        @apply bg-crisiscleanup-yellow-500;
      }
    }
  }
}
</style>
