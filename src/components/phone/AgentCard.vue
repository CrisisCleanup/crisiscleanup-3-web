<template>
  <div class="agentcard shadow-crisiscleanup-card h-full w-full">
    <div class="card-edit">
      <ccu-icon @click.native="() => forceAgentEdit()" size="md" type="edit" />
    </div>
    <div class="profile">
      <div class="profile--img">
        <img
          :src="currentUser && currentUser.profilePictureUrl"
          alt="UserProfile"
          class="rounded-full"
        />
      </div>
      <div class="profile--details">
        <base-text :weight="700" variant="h2">
          {{ currentUser.full_name }}
        </base-text>
        <base-text :weight="400" variant="h2">
          {{ currentUser.mobile }}
        </base-text>
        <base-button
          :action="() => showMoreState.toggle()"
          class="more-info"
          variant="text"
        >
          {{
            showMoreState.state.value ? $t('~~Show Less') : $t('~~Show More')
          }}
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
        <span
          :class="`dot ${!connected && 'disconnected'}  ${
            agent ? agent.friendlyState : ''
          }`"
        />
        <base-text :weight="600" variant="body"
          >{{ agentState.statusText | startCase }}
        </base-text>
      </div>
      <div class="inline-flex action-btn">
        <ProgressButton
          :action="() => handleAgentState()"
          :disabled="!agentState.enabled"
          size="large"
          variant="solid"
          :total="240"
          :value="acwDuration"
        >
          {{ $t(agentState.text) }}
        </ProgressButton>
        <base-button
          :action="onDialer"
          class="dialer"
          size="sm"
          icon-size="md"
          variant="outline"
          ccu-icon="dialer"
          :disabled="!agentState.enabled"
        />
      </div>
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
import { create } from 'vue-modal-dialogs';
import ComponentDialog from '@/components/dialogs/ComponentDialog';
import ContactMoreInfo from '@/components/phone/ContactMoreInfo.vue';
import TrainingsModal from '@/components/phone/TrainingsModal.vue';
import CallerIDEditCard from '@/components/phone/CallerIDEditCard.vue';
import useAgentState from '@/use/phone/useAgentState';
import useAgent from '@/use/phone/useAgent';
import {
  reactive,
  ref,
  onMounted,
  watch,
  computed,
} from '@vue/composition-api';
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
import ProgressButton from '@/components/buttons/ProgressButton.vue';
import OutboundDialer from '@/components/phone/Widgets/OutboundDialer.vue';
import PhoneOutbound from '@/models/PhoneOutbound';
import useIncident from '@/use/worksites/useIncident';
import { EventBus } from '@/event-bus';
import VueTypes from 'vue-types';

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
      return errs;
    }
    return EventBus.$emit('acs:init');
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
    ProgressButton,
  },
  props: {
    numberToDial: VueTypes.string,
  },
  setup(props, context) {
    const showMoreState = useToggle({ state: true });
    const store = useStore();
    const ctrlStore = getModule(ControllerStore, store.value);
    const trainingState = useToggle();

    const { allTrainingCompleted, onTrainingComplete } = useTraining({
      tests: [2, 3],
    });

    const {
      agent,
      agentState,
      toggleAgentState,
      acwDuration,
      connected,
    } = useAgentState({
      ...useAgent(),
      context,
      isTrained: allTrainingCompleted,
    });

    const handleAgentState = () => {
      if (ctrlStore.view.page === ControllerPages.CONTROLLER) {
        context.root.$toasted.error(
          context.root.$t('~~You must complete the open call to take another!'),
        );
        return;
      }
      toggleAgentState();
    };

    const { currentIncident } = useIncident();
    const { currentUser } = useUser();

    const _dialerInput = ref({});

    const onDialer = async (initialValue = '') => {
      await ctrlStore.setServingOutbounds(false);
      const wasOnline = agent.value.isOnline;
      if (wasOnline) {
        await agent.value.toggleOnline(false);
      }
      const compDialog = create(ComponentDialog);
      const modalAction = await compDialog({
        title: context.root.$t('~~Enter a Phone Number'),
        component: OutboundDialer,
        actionText: context.root.$t('~~Dial'),
        listeners: {
          update: (payload) => {
            _dialerInput.value = payload;
          },
        },
        props: {
          class: 'py-12 px-3 flex flex-col',
          initialValue,
        },
      });
      context.root.$log.info('got dialer input:', _dialerInput.value);
      if (_dialerInput.value && modalAction !== 'cancel') {
        const { isValid, e164 } = _dialerInput.value;
        if (isValid) {
          context.root.$log.info('dialer input valid!', e164);
          const outbound = await PhoneOutbound.api().createManual({
            number: e164,
            incidentId: currentIncident.value.id,
            userId: currentUser.value.id,
            language: currentUser.value.primary_language.id,
          });
          if (!agent.value.isOnline) {
            await agent.value.toggleOnline(true);
          }
          await ctrlStore.setServingOutbounds(true);
          await ctrlStore.serveOutbound({
            agent: agent.value,
            incident: currentIncident.value,
          });
          context.root.$toasted.success(
            context.root.$t('~~Success! Calling momentarily...'),
          );
          return outbound;
        }
      }
      await ctrlStore.setServingOutbounds(true);
      if (wasOnline && !agent.value.isOnline) {
        await agent.value.toggleOnline(true);
      }
      return true;
    };

    watch(
      () => props.numberToDial,
      async () => {
        if (props.numberToDial && props.numberToDial !== _dialerInput.value) {
          _dialerInput.value = props.numberToDial;
          await onDialer(props.numberToDial);
        }
      },
    );

    const dialerValue = computed(() =>
      _dialerInput.value ? _dialerInput.value : '',
    );

    return {
      dialerValue,
      connected,
      trainingState,
      showMoreState,
      agent,
      agentState,
      handleAgentState,
      acwDuration,
      onTrainingComplete,
      onDialer,
      currentUser,
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
    justify-content: space-around;
    align-items: center;
    flex-grow: 1;

    .profile--details {
      p {
        @apply pl-1;
      }
    }

    @screen xl {
      justify-content: space-evenly;
      .profile--details {
        p:nth-child(2) {
          @apply text-h1 font-h1;
        }
      }
    }

    &--img {
      @apply shadow-md;
      max-width: 5vw;
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

    .action-btn {
      @apply w-full;
      justify-content: center;
      button.dialer {
        @apply px-2;
        @apply bg-crisiscleanup-dark-500;
        &:hover {
          @apply bg-crisiscleanup-dark-400;
          border: 1px solid transparent;
        }
      }
      .spacer {
        width: 50px;
      }
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
      &.disconnected {
        @apply bg-crisiscleanup-grey-600;
      }
    }
  }
}
</style>
