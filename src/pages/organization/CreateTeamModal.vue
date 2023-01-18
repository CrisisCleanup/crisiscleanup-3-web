<template>
  <modal
    :title="$t('teams.create_new_team')"
    modal-classes="max-w-6xl"
    @close="$emit('close')"
  >
    <div style="display: grid; grid-template-columns: 50% 50%" class="p-2">
      <div class="p-2 flex flex-col justify-between items-start w-full">
        <input
          class="
            text-base
            border border-crisiscleanup-dark-100
            placeholder-crisiscleanup-dark-200
            outline-none
            p-2
            my-2
            resize-none
            w-108
          "
          :required="true"
          type="search"
          v-model="team.name"
          :placeholder="$t('teams.team_name')"
        />
        <base-button
          class="my-3 text-primary-dark underline"
          type="link"
          :text="$t('teams.suggest_name')"
          :alt="$t('teams.suggest_name')"
          :action="generateTeamName"
        />

        <base-text class="mb-2">{{
          `${$t('teams.team_members_list')} (${team.users.length})`
        }}</base-text>
        <draggable
          v-model="team.users"
          itemKey="id"
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
          type="link"
          :text="$t('teams.add_members')"
          :alt="$t('teams.add_members')"
          :action="
            () => {
              view = 'users';
            }
          "
        />

        <base-text class="mb-2">{{
          `${$t('teams.cases')} (${teamWorksites.length})`
        }}</base-text>
        <draggable
          v-model="teamWorksites"
          item-key="id"
          group="cases"
          @start="drag = true"
          @end="drag = false"
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
          type="link"
          :text="$t('teams.assign_cases')"
          :alt="$t('teams.assign_cases')"
          :action="
            () => {
              view = 'cases';
            }
          "
        />
        {{  view }}

        <div class="flex py-4">
          <base-button
            :alt="$t('actions.cancel')"
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
            variant="solid"
            class="px-4 p-2 mx-2"
            :action="saveTeam"
          >
            {{ $t('actions.create') }}
          </base-button>
        </div>
      </div>
      <div class="p-2">
        <template v-if="view === 'users'">
          <base-text variant="h2">{{ $t('teams.members') }}</base-text>
          <base-text class="font-light mb-4"
            >{{ $t('teams.choose_drag_members') }}
          </base-text>
          <base-input
            v-model="currentSearch"
            icon="search"
            class="w-84 mr-4 mb-6"
            :placeholder="$t('actions.search')"
            @input="onSearch"
          ></base-input>
          <draggable
            v-model="usersList"
            itemKey="id"
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
            icon="search"
            class="w-84 mr-4 mb-6"
            :placeholder="$t('actions.search')"
            @input="getClaimedWorksites"
          ></base-input>
          <draggable
            v-model="worksites"
            item-key="id"
            group="cases"
            @start="drag = true"
            @end="drag = false"
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
    <span slot="footer" />
  </modal>
</template>

<script>
import Draggable from 'vuedraggable';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { mapState } from 'vuex';
import Team from '@/models/Team';
import Worksite from '@/models/Worksite';
import Avatar from '@/components/Avatar.vue';
import { getColorForStatus } from '../../filters';
import { getErrorMessage } from '../../utils/errors';
import { getQueryString } from '../../utils/urls';
import WorksiteStatusDropdown from '@/components/WorksiteStatusDropdown.vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import User from '@/models/User';

export default {
  name: 'CreateTeamModal',
  components: { WorksiteStatusDropdown, Avatar, Draggable },
  props: {
    users: {
      type: Array,
      default: () => [],
    },
    cases: {
      type: Array,
      default: () => [],
    },
    teams: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, ctx) {
    const $toasted = useToast();
    const $http = axios;
    const store = useStore();
    const currentUser = computed(() => User.find(store.getters['auth/userId']));
    const usersList = ref([]);
    const caseList = ref([]);
    const currentSearch = ref('');
    const currentCaseSearch = ref('');
    const view = ref('users');
    const team = ref({
        users: [],
        name: `Team ${props.teams.length + 1}`,
        notes: '',
      }
    );
    const teamWorksites = ref([]);
    const worksites = ref([]);
    const currentIncidentId = computed(() => store.getters['incident/currentIncidentId']);

    const getClaimedWorksites = async () => {
      const params = {
        incident: currentIncidentId.value,
        work_type__claimed_by: currentUser.value.organization.id,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by,form_data',
      };

      if (currentCaseSearch.value) {
        params.search = currentCaseSearch;
      }

      const results = await Worksite.api().get(
        `/worksites?${getQueryString(params)}`,
        {
          dataKey: 'results',
        },
      );
      worksites.value = results.entities.worksites;
    };

    const statusValueChange = async (value, workType, worksiteId) => {
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
          users: team.value.users.map((u) => u.id),
        });
        // const [team] = await teamResult.entities.teams;
        if (teamWorksites.value.length) {
          const promises = [];
          teamWorksites.value.forEach((w) =>
            w.work_types.forEach((wt) => {
              if (wt.claimed_by === currentUser.value.organization.id) {
                promises.push(
                  $http.post(
                    `${process.env.VUE_APP_API_BASE_URL}/worksite_work_types_teams`,
                    {
                      team: teteamResult.entities.teams.id,
                      worksite_work_type: wt.id,
                    },
                  ),
                );
              }
            }),
          );
          await Promise.all(promises);
        }
        ctx.emit('saved');
        ctx.emit('close');
      } catch (error) {
        $toasted.error(getErrorMessage(error));
      }
    };
    const onSearch = () => {
      usersList.value = Array.from(
        props.users.filter((user) => {
          return (
            user.full_name
              .toLowerCase()
              .includes(currentSearch.value.toLowerCase()) ||
            user.email.toLowerCase().includes(currentSearch.value.toLowerCase())
          );
        }),
      );
    };
    const onCaseSearch = () => {
      caseList.value = Array.from(
        props.cases.filter((c) => {
          return (
            c.case_number
              .toLowerCase()
              .includes(currentCaseSearch.value.toLowerCase()) ||
            c.work_type
              .toLowerCase()
              .includes(currentCaseSearch.value.toLowerCase())
          );
        }),
      );
    };
    const generateTeamName = () => {
      team.value.name = uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        style: 'capital',
        separator: ' ',
      });
    };

    onMounted(async () => {
      usersList.value = Array.from(props.users);
      caseList.value = Array.from(props.cases);
      await getClaimedWorksites();
    });
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
      onCaseSearch,
      generateTeamName
    };
  },
};
</script>

<style scoped></style>
