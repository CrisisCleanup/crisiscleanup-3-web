<template>
  <modal
    :title="$t('teams.create_new_team')"
    modal-classes="max-w-6xl"
    @close="$emit('close')"
  >
    <div style="display: grid; grid-template-columns: 50% 50%;" class="p-2">
      <div class="p-2 flex flex-col justify-between items-start w-full">
        <input
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-108"
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

        <base-text class="mb-2">{{ $t('teams.team_members_list') }}</base-text>
        <draggable
          v-model="team.users"
          :options="{ group: 'people' }"
          @start="drag = true"
          @end="drag = false"
          handle=".handle"
          class="h-24 overflow-auto w-3/4"
        >
          <div
            v-for="user in team.users"
            :key="user.id"
            class="border-t last:border-b pt-2 bg-white"
            style="display: grid; grid-template-columns: 25px max-content 1fr;"
          >
            <div class="handle" style="width: 15px; margin-top: 2px;">
              <ccu-icon :alt="$t('actions.drag')" size="medium" type="drag" />
            </div>
            <Avatar
              :initials="user.first_name"
              :url="user.profilePictureUrl"
              class="mr-2"
            />
            <span>{{ user.full_name }}</span>
          </div>
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

        <base-text class="mb-2">{{ $t('teams.cases') }}</base-text>
        <draggable
          v-model="teamCases"
          :options="{ group: 'cases' }"
          @start="drag = true"
          @end="drag = false"
          handle=".handle"
          class="h-24 overflow-auto w-3/4"
        >
          <div
            v-for="work_type in teamCases"
            :key="work_type.id"
            class="border-t last:border-b py-3 bg-white"
            style="
              display: grid;
              grid-template-columns: 25px max-content 1fr;
              grid-gap: 10px;
            "
          >
            <div class="handle" style="width: 15px; margin-top: 2px;">
              <ccu-icon :alt="$t('actions.drag')" size="medium" type="drag" />
            </div>
            <div class="badge-holder flex items-center">
              <badge
                class="mx-1"
                :color="
                  getColorForStatus(
                    work_type.status,
                    Boolean(work_type.claimed_by),
                  )
                "
              />
              {{ work_type.case_number }}
            </div>
            <span>{{ work_type.work_type | getWorkTypeName }}</span>
          </div>
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
            :options="{ group: 'people' }"
            @start="drag = true"
            @end="drag = false"
            handle=".handle"
            class="h-full"
          >
            <div
              v-for="user in usersList"
              :key="user.id"
              class="border-t last:border-b pt-2 bg-white"
              style="
                display: grid;
                grid-template-columns: 25px max-content 1fr;
              "
            >
              <div class="handle" style="width: 15px; margin-top: 2px;">
                <ccu-icon :alt="$t('actions.drag')" size="medium" type="drag" />
              </div>
              <Avatar
                :initials="user.first_name"
                :url="user.profilePictureUrl"
                class="mr-2"
              />
              <span>{{ user.full_name }}</span>
            </div>
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
            @input="onCaseSearch"
          ></base-input>
          <draggable
            v-model="caseList"
            :options="{ group: 'cases' }"
            @start="drag = true"
            @end="drag = false"
            handle=".handle"
            class="h-full"
          >
            <div
              v-for="work_type in caseList"
              :key="work_type.id"
              class="border-t last:border-b py-3 bg-white"
              style="
                display: grid;
                grid-template-columns: 25px max-content 1fr;
                grid-gap: 10px;
              "
            >
              <div class="handle" style="width: 15px; margin-top: 2px;">
                <ccu-icon :alt="$t('actions.drag')" size="medium" type="drag" />
              </div>
              <div class="badge-holder flex items-center">
                <badge
                  class="mx-1"
                  :color="
                    getColorForStatus(
                      work_type.status,
                      Boolean(work_type.claimed_by),
                    )
                  "
                />
                {{ work_type.case_number }}
              </div>
              <span>{{ work_type.work_type | getWorkTypeName }}</span>
            </div>
          </draggable>
        </template>
      </div>
    </div>
    <span slot="footer" />
  </modal>
</template>

<script>
import Team from '@/models/Team';
import draggable from 'vuedraggable';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import Avatar from '../../components/Avatar';
import { getColorForStatus } from '../../filters';
import { getErrorMessage } from '../../utils/errors';

export default {
  name: 'CreateTeamModal',
  components: { Avatar, draggable },
  props: {
    users: {
      type: Array,
      default: () => [],
    },
    cases: {
      type: Array,
      default: () => [],
    },
  },
  mounted() {
    this.usersList = Array.from(this.users);
    this.caseList = Array.from(this.cases);
  },
  data() {
    return {
      getColorForStatus,
      usersList: [],
      caseList: [],
      currentSearch: '',
      currentCaseSearch: '',
      view: 'users',
      team: {
        users: [],
        name: '',
        notes: '',
      },
      teamCases: [],
    };
  },
  methods: {
    async saveTeam() {
      try {
        const teamResult = await Team.api().post('/teams', {
          ...this.team,
          users: this.team.users.map((u) => u.id),
        });
        const [team] = await teamResult.entities.teams;
        if (this.teamCases.length) {
          await Promise.all(
            this.teamCases.map((c) =>
              this.$http.post(
                `${process.env.VUE_APP_API_BASE_URL}/worksite_work_types_teams`,
                {
                  team: team.id,
                  worksite_work_type: c.id,
                },
              ),
            ),
          );
        }
        this.$emit('saved');
        this.$emit('close');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    onSearch() {
      this.usersList = Array.from(
        this.users.filter((user) => {
          return (
            user.full_name
              .toLowerCase()
              .includes(this.currentSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(this.currentSearch.toLowerCase())
          );
        }),
      );
    },
    onCaseSearch() {
      this.caseList = Array.from(
        this.cases.filter((c) => {
          return (
            c.case_number
              .toLowerCase()
              .includes(this.currentCaseSearch.toLowerCase()) ||
            c.work_type
              .toLowerCase()
              .includes(this.currentCaseSearch.toLowerCase())
          );
        }),
      );
    },
    generateTeamName() {
      this.team.name = uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        style: 'capital',
        separator: ' ',
      });
    },
  },
};
</script>

<style scoped></style>
