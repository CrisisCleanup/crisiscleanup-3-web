<template>
  <modal
    :title="$t('teams.create_new_team')"
    data-testid="testCreateTeamModal"
    modal-classes="max-w-6xl"
    @close="$emit('close')"
  >
    <div style="display: grid; grid-template-columns: 50% 50%" class="p-2">
      <div class="p-2 flex flex-col justify-between items-start w-full">
        <input
          v-model="team.name"
          data-testid="testTeamNameTextInput"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-108"
          :required="true"
          type="search"
          :placeholder="$t('teams.team_name')"
        />
        <base-button
          class="my-3 text-primary-dark underline"
          data-testid="testSuggestNameButton"
          type="link"
          :text="$t('teams.suggest_name')"
          :alt="$t('teams.suggest_name')"
          :action="generateTeamName"
        />

        <base-text class="mb-2">
          {{ `${$t('teams.team_members_list')} (${team.users.length})` }}
        </base-text>
        <draggable
          v-model="team.users"
          data-testid="testTeamUsersDrag"
          item-key="id"
          group="people"
          handle=".handle"
          class="h-32 overflow-scroll w-3/4 border"
        >
          <template #item="{ element: user }">
            <div
              :key="`${user.id}`"
              class="border-b pt-2 bg-white"
              style="display: grid; grid-template-columns: 25px max-content 1fr"
            >
              <div class="handle" style="width: 15px; margin-top: 2px">
                <ccu-icon
                  icon-classes="cursor-move"
                  data-testid="testTeamUsers.DragIcon"
                  :alt="$t('actions.drag')"
                  size="medium"
                  type="drag"
                />
              </div>
              <Avatar
                :initials="user.first_name"
                :url="user.profilePictureUrl"
                class="mr-2"
                size="xsmall"
              />
              <span>{{ user.full_name }}</span>
            </div>
          </template>
        </draggable>
        <base-button
          class="my-3 text-primary-dark underline"
          data-testid="testAddMembersButton"
          type="link"
          :text="$t('teams.add_members')"
          :alt="$t('teams.add_members')"
          :action="() => (view = 'users')"
        />

        <base-text class="mb-2">{{
          `${$t('teams.cases')} (${teamWorksites.length})`
        }}</base-text>
        <draggable
          v-model="teamWorksites"
          data-testid="testTeamWorksitesDrag"
          item-key="id"
          group="cases"
          handle=".handle"
          class="h-32 overflow-scroll w-3/4 border"
        >
          <template #item="{ element: worksite }">
            <div
              class="border-b py-3 px-3 bg-white"
              style="
                display: grid;
                grid-template-columns: 25px max-content 1fr 1fr 1fr;
                grid-gap: 10px;
              "
            >
              <div class="handle" style="width: 15px; margin-top: 2px">
                <ccu-icon
                  icon-classes="cursor-move"
                  data-testid="testWorksitesDragIcon"
                  :alt="$t('actions.drag')"
                  size="medium"
                  type="drag"
                />
              </div>
              <span>{{ worksite.case_number }}</span>
              <div class="flex flex-wrap w-full">
                <div
                  v-for="work_type in worksite.work_types"
                  :key="`${work_type.id}`"
                  class="mx-1"
                >
                  <WorksiteStatusDropdown
                    class="block"
                    :current-work-type="work_type"
                    use-icon
                    hide-name
                    @input="
                      (value) => {
                        statusValueChange(value, work_type, worksite.id);
                      }
                    "
                  />
                </div>
              </div>
              <span>{{ worksite.name }}</span>
              <span>{{ worksite.full_address }}</span>
            </div>
          </template>
        </draggable>
        <base-button
          class="my-3 text-primary-dark underline"
          data-testid="testAssignCasesButton"
          type="link"
          :text="$t('teams.assign_cases')"
          :alt="$t('teams.assign_cases')"
          :action="() => (view = 'cases')"
        />
        {{ view }}
      </div>
      <div class="p-2">
        <template v-if="view === 'users'">
          <base-text variant="h2">{{ $t('teams.members') }}</base-text>
          <base-text class="font-light mb-4"
            >{{ $t('teams.choose_drag_members') }}
          </base-text>
          <base-input
            v-model="currentSearch"
            data-testid="testSearchDragMembersSearch"
            icon="search"
            class="w-84 mr-4 mb-6"
            :placeholder="$t('actions.search')"
            @update:model-value="onSearch"
          ></base-input>
          <draggable
            v-model="usersList"
            data-testid="testUsersListDrag"
            item-key="id"
            group="people"
            handle=".handle"
            class="h-96 overflow-scroll"
          >
            <template #item="{ element: user }">
              <div
                class="border-t last:border-b pt-2 bg-white"
                style="
                  display: grid;
                  grid-template-columns: 25px max-content 1fr;
                "
              >
                <div class="handle" style="width: 15px; margin-top: 2px">
                  <ccu-icon
                    icon-classes="cursor-move"
                    :alt="$t('actions.drag')"
                    size="medium"
                    type="drag"
                  />
                </div>
                <Avatar
                  :initials="user.first_name"
                  :url="user.profilePictureUrl"
                  class="mr-2"
                  size="xsmall"
                />
                <span>{{ user.full_name }}</span>
              </div>
            </template>
          </draggable>
        </template>
        <template v-if="view === 'cases'">
          <base-text variant="h2">{{ $t('teams.cases') }}</base-text>
          <base-text class="font-light mb-4"
            >{{ $t('teams.choose_drag_cases') }}
          </base-text>
          <base-input
            v-model="currentCaseSearch"
            data-testid="testCurrentCaseSearchSearch"
            icon="search"
            class="w-84 mr-4 mb-6"
            :placeholder="$t('actions.search')"
            @update:model-value="getClaimedWorksites"
          ></base-input>
          <draggable
            v-model="worksites"
            data-testid="testWorksitesDrag"
            item-key="id"
            group="cases"
            handle=".handle"
            class="h-96 overflow-scroll"
          >
            <template #item="{ element: worksite }">
              <div
                class="border-t last:border-b py-3 px-3 bg-white"
                style="
                  display: grid;
                  grid-template-columns: 25px max-content 1fr 1fr 1fr;
                  grid-gap: 10px;
                "
              >
                <div class="handle" style="width: 15px; margin-top: 2px">
                  <ccu-icon
                    icon-classes="cursor-move"
                    :alt="$t('actions.drag')"
                    size="medium"
                    type="drag"
                  />
                </div>
                <span>{{ worksite.case_number }}</span>
                <div class="flex flex-wrap w-full">
                  <div
                    v-for="work_type in worksite.work_types"
                    :key="`${work_type.id}`"
                    class="mx-1"
                  >
                    <WorksiteStatusDropdown
                      class="block"
                      :current-work-type="work_type"
                      use-icon
                      hide-name
                      @input="
                        (value) => {
                          statusValueChange(value, work_type, worksite.id);
                        }
                      "
                    />
                  </div>
                </div>
                <span>{{ worksite.name }}</span>
                <span>{{ worksite.full_address }}</span>
              </div>
            </template>
          </draggable>
        </template>
      </div>
    </div>
    <template #footer>
      <div class="flex py-4 justify-center items-center">
        <base-button
          :alt="$t('actions.cancel')"
          data-testid="testCancelButton"
          class="px-4 p-2 border border-black mx-2"
          :action="
            () => {
              $emit('close');
            }
          "
        >
          {{ $t('actions.cancel') }}
        </base-button>
        <base-button
          :alt="$t('actions.create')"
          data-testid="testCreateButton"
          variant="solid"
          class="px-4 p-2 mx-2"
          :action="saveTeam"
        >
          {{ $t('actions.create') }}
        </base-button>
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
import Draggable from 'vuedraggable';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { useToast } from 'vue-toastification';
import type { PropType } from 'vue';
import Team from '@/models/Team';
import Worksite from '@/models/Worksite';
import Avatar from '@/components/Avatar.vue';
import { getErrorMessage } from '@/utils/errors';
import { getQueryString } from '@/utils/urls';
import WorksiteStatusDropdown from '@/components/WorksiteStatusDropdown.vue';
import User from '@/models/User';

export default defineComponent({
  name: 'CreateTeamModal',
  components: { WorksiteStatusDropdown, Avatar, Draggable },
  props: {
    users: {
      type: Array as PropType<User[]>,
      default: () => [],
    },
    cases: {
      type: Array as PropType<Worksite[]>,
      default: () => [],
    },
    teams: {
      type: Array as PropType<Team[]>,
      default: () => [],
    },
  },
  emits: ['saved', 'close', 'reloadMap', 'reloadTable'],
  setup(props, ctx) {
    const $toasted = useToast();
    const ccuApi = useApi();
    const store = useStore();
    const currentUser = computed(
      () => User.find(store.getters['auth/userId']) as User,
    );
    const usersList = ref<unknown[]>([]);
    const caseList = ref<unknown[]>([]);
    const currentSearch = ref('');
    const currentCaseSearch = ref('');
    const view = ref('users');
    const team = ref<Partial<Team>>({
      users: [],
      name: `Team ${props.teams.length + 1}`,
      notes: '',
    });
    const teamWorksites = ref<Worksite[]>([]);
    const worksites = ref<Worksite[]>([]);
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );

    onMounted(async () => {
      usersList.value = [...props.users];
      caseList.value = [...props.cases];
      await getClaimedWorksites();
    });

    const getClaimedWorksites = async () => {
      const params: Record<string, unknown> = {
        incident: currentIncidentId.value,
        work_type__claimed_by: currentUser.value.organization.id,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by,form_data',
      };

      if (currentCaseSearch.value) {
        params.search = currentCaseSearch.value;
      }

      const results = await Worksite.api().get(
        `/worksites?${getQueryString(params)}`,
        {
          dataKey: 'results',
        },
      );
      worksites.value = (results.entities?.worksites || []) as Worksite[];
    };

    const statusValueChange = async (
      value: any,
      workType: Record<string, unknown>,
      worksiteId: number,
    ) => {
      try {
        await Worksite.api().updateWorkTypeStatus(workType.id, value);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        await Worksite.api().fetch(worksiteId);
        ctx.emit('reloadMap', worksiteId);
        ctx.emit('reloadTable');
      }
    };

    const saveTeam = async () => {
      try {
        const teamResult = await Team.api().post('/teams', {
          ...team.value,
          incident: currentIncidentId.value,
          users: team.value.users && team.value.users.map((u) => u.id),
        });
        const _team = (await teamResult.entities?.teams?.[0]) as Team;
        if (!_team) {
          throw new Error('Team not found. Something went wrong.');
        }

        if (teamWorksites.value.length > 0) {
          const promises = [];
          for (const w of teamWorksites.value) {
            for (const wt of w.work_types) {
              if (wt.claimed_by === currentUser.value.organization.id) {
                const { success } = ccuApi('/worksite_work_types_teams', {
                  method: 'POST',
                  data: {
                    team: _team.id,
                    worksite_work_type: wt.id,
                  },
                });
                promises.push(success());
              }
            }
          }

          await Promise.all(promises);
        }

        ctx.emit('saved');
        ctx.emit('close');
      } catch (error) {
        $toasted.error(getErrorMessage(error));
      }
    };

    const onSearch = () => {
      usersList.value = props.users.filter((user) => {
        return (
          user.full_name
            .toLowerCase()
            .includes(currentSearch.value.toLowerCase()) ||
          user.email.toLowerCase().includes(currentSearch.value.toLowerCase())
        );
      });
    };

    const generateTeamName = () => {
      team.value.name = uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        style: 'capital',
        separator: ' ',
      });
    };

    return {
      usersList,
      currentSearch,
      currentCaseSearch,
      view,
      team,
      teamWorksites,
      worksites,
      currentIncidentId,
      getClaimedWorksites,
      statusValueChange,
      saveTeam,
      onSearch,
      generateTeamName,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
