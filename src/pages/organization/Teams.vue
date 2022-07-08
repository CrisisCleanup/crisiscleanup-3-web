<template>
  <div class="px-8 py-4">
    <div class="flex justify-between items-center">
      <base-input
        v-model="currentSearch"
        icon="search"
        class="w-84 mr-4 mb-6"
        :placeholder="$t('actions.search')"
        @input="onSearch"
      ></base-input>
    </div>
    <div style="display: grid; grid-template-columns: 0.75fr 2fr" class="h-120">
      <div class="border bg-white">
        <div class="flex items-center justify-between px-2 py-3">
          <span>{{ $t('teams.team_management') }}</span>
          <base-button
            :text="$t('teams.create_new_team')"
            variant="solid"
            size="small"
            :action="
              () => {
                creatingTeam = true;
              }
            "
          />
        </div>
        <div
          style="
            display: grid;
            grid-template-columns: auto;
            grid-auto-rows: min-content;
          "
          class="overflow-auto h-120"
        >
          <div
            v-for="team in teams"
            :key="`${team.id}`"
            class="
              h-full
              px-4
              pt-2
              pb-6
              hover:bg-crisiscleanup-light-grey
              cursor-pointer
            "
            :class="
              String(team.id) === String($route.params.team_id)
                ? 'bg-crisiscleanup-light-grey'
                : 'bg-white'
            "
            @click="
              () => {
                $router.push(`/organization/teams/${team.id}`);
              }
            "
          >
            <div class="flex justify-between items-center">
              <base-text>{{ team.name }}</base-text>
              <base-text
                >{{ getAssignedWorkTypes(team).length }}
                {{ $t('teams.cases_assigned') }}
              </base-text>
            </div>
            <div>
              {{ getCaseCompletion(team) }} {{ $t('teams.cases_completed') }}
            </div>
            <div class="mt-2 grid users-avatars-list">
              <template v-for="user in team.users.map((u) => getUser(u))">
                <Avatar
                  v-if="user"
                  :key="`${user.id}`"
                  :initials="user.first_name"
                  :url="user.profilePictureUrl"
                  class="mr-2"
                  size="xsmall"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="h-full">
        <div class="h-full flex flex-col bg-white shadow">
          <router-view
            v-show="teams && teams.length"
            :work-types="claimedWorktypes"
            :users="usersWithoutTeams"
            :teams="teams"
            :key="$route.params.team_id"
            @reload="getData"
          ></router-view>
        </div>
      </div>
    </div>
    <CreateTeamModal
      v-if="creatingTeam"
      @close="creatingTeam = false"
      @saved="getData"
      :users="usersWithoutTeams"
      :cases="claimedWorktypes"
      :teams="teams"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { UserMixin } from '@/mixins';
import User from '@/models/User';
import Team from '@/models/Team';
import Worksite from '@/models/Worksite';
import Avatar from '../../components/Avatar';
import CreateTeamModal from './CreateTeamModal';
import { getQueryString } from '../../utils/urls';
import enums from '../../store/modules/enums';

export default {
  name: 'Teams',
  components: { CreateTeamModal, Avatar },
  mixins: [UserMixin],

  methods: {
    async onSearch() {
      await this.getTeams();
    },
    async getTeams() {
      const results = await Team.api().get(
        `/teams?search=${this.currentSearch || ''}&limit=500&incident=${
          this.currentIncidentId
        }`,
        {
          dataKey: 'results',
        },
      );
      this.teams = results.entities.teams;
    },
    getAssignedWorkTypes(team) {
      return this.claimedWorktypes.filter((wt) => {
        return team.assigned_work_types.map((awt) => awt.id).includes(wt.id);
      });
    },
    getCaseCompletion(team) {
      const workTypes = this.getAssignedWorkTypes(team);
      if (workTypes && workTypes.length) {
        return Number(
          (workTypes.filter((wt) => Boolean(wt.completed)).length /
            workTypes.length) *
            100,
        ).toFixed(0);
      }
      return 0;
    },
    async getClaimedWorksites() {
      const params = {
        incident: this.currentIncidentId,
        work_type__claimed_by: this.currentUser.organization.id,
        limit: 500,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by,form_data',
      };

      Worksite.api().get(`/worksites?${getQueryString(params)}`, {
        dataKey: 'results',
      });
    },
    async getData() {
      const results = await User.api().get(
        `/users?organization=${this.currentUser.organization.id}&limit=500`,
        {
          dataKey: 'results',
        },
      );
      const usersWithoutTeamsResults = await User.api().get(
        `/users?organization=${this.currentUser.organization.id}&no_team_incident=${this.currentIncidentId}&limit=500`,
        {
          dataKey: 'results',
        },
      );
      this.users = results.entities.users;
      this.usersWithoutTeams = usersWithoutTeamsResults.entities.users;
      await this.getTeams();
      await this.getClaimedWorksites();
    },
  },
  data() {
    return {
      currentSearch: '',
      creatingTeam: false,
      users: [],
      usersWithoutTeams: [],
      teams: [],
    };
  },
  computed: {
    claimedWorktypes() {
      const query = Worksite.query().where((worksite) => {
        if (
          worksite.work_types &&
          this.currentIncidentId === worksite.incident
        ) {
          const claimed = worksite.work_types.find(
            (workType) =>
              workType.claimed_by === this.currentUser.organization.id,
          );
          return Boolean(claimed);
        }
        return false;
      });
      const worksites = query.get();
      const workTypes = [];
      worksites.forEach((w) => {
        w.work_types.forEach((wt) => {
          if (wt.claimed_by === this.currentUser.organization.id) {
            const closedStatuses = enums.state.statuses.filter(
              (status) => status.primary_state === 'closed',
            );

            workTypes.push({
              case_number: w.case_number,
              phone1: w.phone1,
              location: w.location,
              name: w.name,
              email: w.email,
              ...wt,
              completed: closedStatuses
                .map((status) => status.status)
                .includes(wt.status),
            });
          }
        });
      });
      return workTypes;
    },
    ...mapState('incident', ['currentIncidentId']),
    ...mapState('enums', ['statuses']),
  },
  watch: {
    currentIncidentId(newState, oldState) {
      if (String(newState) !== String(oldState)) {
        this.getData().then(() => {});
      }
    },
  },
  async mounted() {
    await this.getData();
  },
};
</script>

<style scoped>
.users-avatars-list {
  grid-template-columns: repeat(auto-fill, 3.5rem);
}
</style>
