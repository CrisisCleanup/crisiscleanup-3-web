<template>
  <div class="form-container">
    <div class="grid grid-cols-1 justify-start h-fit">
      <base-select
        :model-value="persistentInvitationType"
        data-testid="testPersistentInvitationTypeSelect"
        class="my-2"
        :options="persistentInvitationTypeOptions"
        searchable
        select-classes="bg-white w-full h-10"
        item-key="id"
        label="name"
        :placeholder="$t('~~Persistent Invitation Type')"
        @update:modelValue="persistentInvitationType = $event"
      />

      <base-select
        v-if="persistentInvitationType === 'Team'"
        :model-value="selectedTeam"
        data-testid="testTeamSelect"
        class="my-2"
        :options="teams"
        searchable
        select-classes="bg-white w-full h-10"
        item-key="id"
        label="name"
        :placeholder="$t('~~Select Team')"
        @update:modelValue="selectedTeam = $event"
      />

      <base-checkbox
        v-model="requiresApproval"
        data-testid="testRequiresApprovalCheckbox"
        class="text-base"
      >
        <div>
          {{ $t('~~Requires Approval') }}
        </div>
      </base-checkbox>

      <base-button
        variant="solid"
        data-testid="testSaveInvitationButton"
        :action="saveInvitation"
        :text="$t('actions.submit')"
        :alt="$t('actions.submit')"
        class="p-3 px-6 justify-self-end"
      />
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { useToast } from 'vue-toastification';
import Team from '@/models/Team';
import { getErrorMessage } from '@/utils/errors';
import User from '@/models/User';
import { computed } from "vue";
import useEmitter from "@/hooks/useEmitter";

export default defineComponent({
  name: 'SampleForm',

  setup() {
    const { t } = useI18n();
    const $toasted = useToast();
    const { emitter } = useEmitter();
    const store = useStore();
    const currentUser = computed(() => User.find(store.getters['auth/userId']));
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );

    const persistentInvitationType = ref<string | null>(null);
    const selectedTeam = ref<string | null>(null);
    const requiresApproval = ref<boolean>(false);

    const persistentInvitationTypeOptions = [
      { id: 'Team', name: 'Team' },
      { id: 'Organization', name: 'Organization' },
    ];

    const teams = Team.all().map((team) => ({
      id: team.id,
      name: team.name,
    })) as { id: string; name: string }[];

    const getTeams = async () => {
      await Team.api().get(
        `/teams?limit=500&incident=${
          currentIncidentId.value
        }`,
        {
          dataKey: 'results',
        },
      );
    };
    const saveInvitation = async () => {
      const url = `${
        import.meta.env.VITE_APP_API_BASE_URL
      }/persistent_invitations`;
      const data = {
        model: persistentInvitationType.value,
        object_id: persistentInvitationType.value === 'Team'
          ? selectedTeam.value
          : currentUser.value.organization.id,
        requires_approval: requiresApproval.value,
      };

      try {
        await axios.post(url, data);
        $toasted.success(t('~~Successfully created persistent invitation.'));
        return emitter.emit('modal_component:close', 'persistent_invitation_modal');
      } catch (error) {
        return $toasted.error(getErrorMessage(error));
      }
    };

    onMounted(async () => {
      await getTeams();
    });

    return {
      persistentInvitationType,
      selectedTeam,
      persistentInvitationTypeOptions,
      teams,
      requiresApproval,
      saveInvitation,
    };
  },
});
</script>

<style scoped></style>
