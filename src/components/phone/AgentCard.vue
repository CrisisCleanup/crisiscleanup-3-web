<template>
  <div class="agentcard shadow-crisiscleanup-card h-full w-full">
    <div class="card-edit">
      <ccu-icon
        :alt="$t('phoneDashboard.edit_user_phone_number')"
        @click.native="() => forceAgentEdit()"
        size="md"
        type="edit"
      />
    </div>
    <div class="profile">
      <div class="profile--img">
        <Avatar
          :initials="currentUser && currentUser.first_name"
          :url="currentUser && currentUser.profilePictureUrl"
          size="small"
          inner-classes="shadow"
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
            showMoreState.state.value
              ? $t('actions.show_less')
              : $t('actions.show_more')
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
          >{{ $t(agentState.statusText) | startCase }}
        </base-text>
      </div>
      <div class="inline-flex action-btn">
        <ProgressButton
          :alt="$t(agentState.text)"
          :action="() => handleStateChange({ userInitiated: true })"
          :disabled="!agentState.enabled"
          :total="240"
          :value="acwDuration"
          size="large"
          variant="solid"
          @update:done="() => handleStateChange()"
        >
          {{ $t(agentState.text) }}
        </ProgressButton>
        <base-button
          :action="onDialer"
          :disabled="!agentState.enabled || isCallActive"
          ccu-icon="dialer"
          class="dialer"
          icon-size="md"
          size="sm"
          variant="outline"
          :alt="$t('actions.manual_dialer')"
        />
      </div>
    </div>
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
import { useStore, useRouter } from '@u3u/vue-hooks';
import { getModule } from 'vuex-module-decorators';
import { unwrap } from '@/utils/wrap';
import ProgressButton from '@/components/buttons/ProgressButton.vue';
import OutboundDialer from '@/components/phone/Widgets/OutboundDialer.vue';
import PhoneOutbound from '@/models/PhoneOutbound';
import useIncident from '@/use/worksites/useIncident';
import { EventBus } from '@/event-bus';
import VueTypes from 'vue-types';
import ControllerStore from '@/store/modules/phone/controller';
import Avatar from '@/components/Avatar';

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
    ProgressButton,
    Avatar,
  },
  props: {
    numberToDial: VueTypes.string,
    userTrainingItems: VueTypes.array,
    trainingItems: VueTypes.array,
    trainingComplete: VueTypes.bool,
  },
  setup(props, context) {
    const showMoreState = useToggle({ state: true });
    const store = useStore();
    const ctrlStore = getModule(ControllerStore, store.value);
    const trainingState = useToggle();

    const { onTrainingComplete } = useTraining({
      tests: [2, 3, 4],
    });

    const { agent, agentState, toggleAgentState, acwDuration, connected } =
      useAgentState({
        ...useAgent(),
        context,
        // isTrained: props.trainingComplete,
        isTrained: true,
      });

    const handleStateChange = async (args) => {
      // if (!props.trainingComplete) {
      //   if (agent.value && agent.value.isOnline) {
      //     await agent.value.toggleOnline(false);
      //   }
      //   context.emit('phone:showTraining', true);
      //   return;
      // }
      await toggleAgentState(args);
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
        title: context.root.$t('phoneDashboard.enter_phone_number'),
        component: OutboundDialer,
        actionText: context.root.$t('actions.dial'),
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
      context.emit('dialer:close');
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
            manual: true,
          });
          context.root.$toasted.success(
            context.root.$t('phoneDashboard.success_calling_momentarily'),
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

    const { route } = useRouter();
    watch([route, connected], async () => {
      if (route.value.query && route.value.query.dialNumber) {
        if (route.value.query.dialNumber !== _dialerInput.value) {
          _dialerInput.value = route.value.query.dialNumber;
          await onDialer(_dialerInput.value);
        }
      }
    });

    const dialerValue = computed(() =>
      _dialerInput.value ? _dialerInput.value : '',
    );

    return {
      isCallActive: ctrlStore.isCallActive,
      handleStateChange,
      dialerValue,
      connected,
      trainingState,
      showMoreState,
      agent,
      agentState,
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
