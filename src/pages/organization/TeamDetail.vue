<template>
  <div class="bg-white h-full h-84">
    <div class="flex justify-between">
      <div class="font-semibold flex justify-between items-center h-12 px-3">
        {{ team.name }}
      </div>
      <div class="flex flex-wrap items-center justify-end">
        <ccu-icon
          :alt="$t('actions.jump_to_case')"
          size="small"
          class="p-1 py-2"
          type="go-case"
          @click.native="showAllOnMap"
        />
        <ccu-icon
          :alt="$t('actions.delete')"
          type="trash"
          class="mx-2"
          size="small"
          @click.native="
            () => {
              deleteCurrentTeam();
            }
          "
        />
      </div>
    </div>
    <tabs class="w-full" ref="tabs">
      <tab :name="$t('~~Manage Users')">
        <div class="flex items-center justify-between py-2">
          <base-button
            class="my-1 text-primary-dark"
            type="link"
            :text="$t('teams.add_members')"
            :alt="$t('teams.add_members')"
            :action="
              () => {
                showAddMembersModal = true;
              }
            "
          />
        </div>
        <div class="mt-2 h-40 overflow-auto">
          <draggable
            v-model="allTeamUsers"
            :options="{ group: 'people' }"
            @start="drag = true"
            @end="drag = false"
            handle=".handle"
          >
            <div
              v-for="user in allTeamUsers"
              :key="user.id"
              class="border-t last:border-b pt-4 bg-white"
              style="
                display: grid;
                grid-template-columns: 25px max-content 20% 35% 30% 1fr;
              "
            >
              <div class="handle" style="width: 15px; margin-top: 2px;">
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
              />
              <span>{{ user.full_name }}</span>
              <span>
                <font-awesome-icon icon="envelope" />
                {{ user.email }}
              </span>
              <span>
                <font-awesome-icon icon="phone" />
                {{ user.mobile }}
              </span>
              <div style="margin-top: 2px;" class="flex justify-end">
                <base-dropdown
                  :trigger="'click'"
                  class-name="team-detail-user"
                  :x="-145"
                >
                  <ccu-icon
                    slot="icon"
                    :alt="$t('teams.settings')"
                    size="medium"
                    type="settings"
                  />
                  <template slot="body">
                    <ul class="overflow-auto w-40">
                      <li
                        class="py-2 cursor-pointer hover:bg-crisiscleanup-light-grey"
                      >
                        <a :href="`mailto:${user.email}`">{{
                          $t('teams.send_email')
                        }}</a>
                      </li>
                      <li
                        class="py-2 cursor-pointer hover:bg-crisiscleanup-light-grey"
                      >
                        <a :href="`/organization/users/${user.id}`">
                          {{ $t('teams.view_full_profile') }}
                        </a>
                      </li>
                      <li
                        class="py-2 cursor-pointer hover:bg-crisiscleanup-light-grey"
                        @click="
                          () => {
                            moveToDifferentTeam(user.id);
                          }
                        "
                      >
                        {{ $t('teams.move_to_another_team') }}
                      </li>
                      <li
                        class="py-2 cursor-pointer hover:bg-crisiscleanup-light-grey"
                        @click="
                          () => {
                            removeFromTeam(user.id);
                          }
                        "
                      >
                        {{ $t('teams.remove_from_team') }}
                      </li>
                    </ul>
                  </template>
                </base-dropdown>
              </div>
            </div>
          </draggable>
        </div>
      </tab>
      <tab :name="$t('~~Manage Cases')">
        <div class="flex items-center justify-between py-2">
          <base-button
            class="my-1 text-primary-dark"
            type="link"
            :text="$t('teams.assign_cases')"
            :alt="$t('teams.assign_cases')"
            :action="
              () => {
                showAddCasesModal = true;
              }
            "
          />
        </div>
        <div class="mt-2 overflow-auto">
          <draggable
            v-model="assignedWorksites"
            :options="{ group: 'cases' }"
            @start="drag = true"
            @end="drag = false"
            handle=".handle"
            class="overflow-auto"
          >
            <div
              v-for="worksite in assignedWorksites"
              :key="worksite.id"
              class="border-t last:border-b py-3 bg-white"
              style="
                display: grid;
                grid-template-columns: 25px 100px 175px 0.75fr 1.5fr 1fr 25px;
              "
            >
              <div class="handle" style="width: 15px; margin-top: 2px;">
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
                  :key="work_type.id"
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
              <span>
                <font-awesome-icon icon="phone" />
                {{ worksite.phone1 }}
              </span>
              <div class="flex items-start">
                <ccu-icon
                  :alt="$t('actions.jump_to_case')"
                  size="small"
                  class="p-1 py-2"
                  type="go-case"
                  @click.native="
                    () => {
                      showOnMap(worksite);
                    }
                  "
                />
              </div>
            </div>
          </draggable>
        </div>
      </tab>
      <tab :name="$t('~~Notes')">
        <base-input
          :value="team.notes"
          text-area
          rows="4"
          :placeholder="$t('teams.notes')"
          @input="updateNotes"
          @blur="updateCurrentTeam"
        />
      </tab>
    </tabs>

    <modal
      v-if="showAddMembersModal"
      title="Add Members"
      closeable
      @close="showAddMembersModal = false"
      modal-classes="max-w-xl"
    >
      <div class="px-5 py-2">
        <div class="py-2">
          {{ $t('teams.choose_members') }}
        </div>
        <base-input
          v-model="currentUserSearch"
          icon="search"
          class="w-64 mr-4 mb-6"
          :placeholder="$t('actions.search')"
          @input="onUserSearch"
        ></base-input>

        <div class="h-64 overflow-auto">
          <div
            v-for="user in userResults.filter(
              (user) => !team.users.includes(user.id),
            )"
            class="border-t pt-2"
          >
            <base-checkbox
              :value="usersToAdd.includes(user.id)"
              @input="
                (value) => {
                  if (value) {
                    usersToAdd.push(user.id);
                  } else {
                    usersToAdd = usersToAdd.filter((id) => id !== user.id);
                  }
                }
              "
            >
              <div class="flex">
                <Avatar
                  :initials="user.first_name"
                  :url="user.profilePictureUrl"
                  class="mr-2"
                />
                {{ user.full_name }}
              </div>
            </base-checkbox>
          </div>
        </div>
      </div>
      <div slot="footer" class="p-3 flex items-center justify-center">
        <base-button
          :action="
            () => {
              showAddMembersModal = false;
            }
          "
          :text="$t('actions.cancel')"
          variant="outline"
          class="ml-2 p-3 px-6 text-xs"
        />
        <base-button
          variant="solid"
          :action="addUsers"
          :text="$t('actions.add')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
    <modal
      v-if="showAddCasesModal"
      :title="$t('~~Assign Cases')"
      closeable
      @close="showAddCasesModal = false"
      modal-classes="max-w-4xl"
    >
      <div class="flex">
        <div class="w-1/3">
          <WorkTypeMap
            class="w-full h-96"
            :work-types="mapWorkTypes"
          ></WorkTypeMap>
        </div>
        <div class="w-2/3 px-5 py-2">
          <div class="py-2">
            {{ $t('teams.choose_cases') }}
          </div>
          <base-input
            v-model="currentCaseSearch"
            icon="search"
            class="w-64 mr-4 mb-6"
            :placeholder="$t('actions.search')"
            @input="getClaimedWorksites"
          ></base-input>
          <div class="h-64 overflow-auto">
            <div
              v-for="worksite in selectableWorksites"
              :key="worksite.id"
              class="border-t last:border-b py-3 px-3 bg-white"
              style="
                display: grid;
                grid-template-columns: 25px max-content 1fr 1fr 1fr;
                grid-gap: 10px;
              "
            >
              <base-checkbox
                @input="
                  (value) => {
                    const ids = worksite.work_types
                      .filter(
                        (type) =>
                          type.claimed_by === currentUser.organization.id,
                      )
                      .map((wt) => wt.id);
                    if (value) {
                      casesToAdd.push(...ids);
                    } else {
                      casesToAdd = casesToAdd.filter((id) => !ids.includes(id));
                    }
                  }
                "
              />
              <span>{{ worksite.case_number }}</span>
              <div class="flex flex-wrap w-full">
                <div
                  v-for="work_type in worksite.work_types"
                  :key="work_type.id"
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
          </div>
        </div>
      </div>
      <div slot="footer" class="p-3 flex items-center justify-center">
        <base-button
          :action="
            () => {
              showAddCasesModal = false;
              currentCaseSearch = null;
              getClaimedWorksites();
            }
          "
          :text="$t('actions.cancel')"
          variant="outline"
          class="ml-2 p-3 px-6 text-xs"
        />
        <base-button
          variant="solid"
          :action="addCases"
          :text="$t('actions.add')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>

<script>
import Team from '@/models/Team';
import Worksite from '@/models/Worksite';
import { UserMixin, DialogsMixin } from '@/mixins';
import draggable from 'vuedraggable';
import { mapState } from 'vuex';
import Avatar from '../../components/Avatar';
import { getColorForStatus } from '../../filters';
import WorksiteStatusDropdown from '../../components/WorksiteStatusDropdown';
import { getErrorMessage } from '../../utils/errors';
import WorkTypeMap from '../../components/WorkTypeMap';
import { getQueryString } from '../../utils/urls';

export default {
  name: 'TeamDetail',
  components: { WorkTypeMap, WorksiteStatusDropdown, Avatar, draggable },
  mixins: [UserMixin, DialogsMixin],
  async mounted() {
    await Team.api().get(`/teams/${this.$route.params.team_id}`);
    await this.getClaimedWorksites();
  },
  props: {
    workTypes: {
      type: Array,
      default: () => [],
    },
    users: {
      type: Array,
      default: () => [],
    },
    teams: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      getColorForStatus,
      currentUsers: [],
      userResults: [],
      caseResults: [],
      usersToAdd: [],
      casesToAdd: [],
      worksites: [],
      showAddMembersModal: false,
      showAddCasesModal: false,
      currentUserSearch: '',
      currentCaseSearch: '',
    };
  },
  watch: {
    showAddMembersModal() {
      this.onUserSearch();
    },
    showAddCasesModal() {
      this.onCaseSearch();
    },
  },
  methods: {
    async getClaimedWorksites() {
      const params = {
        incident: this.currentIncidentId,
        work_type__claimed_by: this.currentUser.organization.id,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by,form_data',
      };

      if (this.currentCaseSearch) {
        params.search = this.currentCaseSearch;
      }

      const results = await Worksite.api().get(
        `/worksites?${getQueryString(params)}`,
        {
          dataKey: 'results',
        },
      );
      this.worksites = results.entities.worksites;
    },
    onUserSearch() {
      this.userResults = Array.from(
        this.users.filter((user) => {
          return (
            user.full_name
              .toLowerCase()
              .includes(this.currentUserSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(this.currentSearch.toLowerCase())
          );
        }),
      );
    },
    onCaseSearch() {
      this.caseResults = Array.from(
        this.workTypes.filter((c) => {
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
    async addUsers() {
      Team.update({
        where: this.team.id,
        data: {
          users: Array.from(new Set([...this.team.users, ...this.usersToAdd])),
        },
      });

      await this.updateCurrentTeam();
      this.usersToAdd = [];
      this.showAddMembersModal = false;
    },
    updateNotes(value) {
      Team.update({
        where: this.team.id,
        data: {
          notes: value,
        },
      });
    },
    async updateCurrentTeam() {
      await Team.api().patch(`/teams/${this.team.id}`, this.team.$toJson());
    },
    async updateTeam(id, data) {
      await Team.api().patch(`/teams/${id}`, data);
    },
    async addCases() {
      if (this.casesToAdd.length) {
        await Promise.all(
          this.casesToAdd.map((c) =>
            this.$http.post(
              `${process.env.VUE_APP_API_BASE_URL}/worksite_work_types_teams`,
              {
                team: this.team.id,
                worksite_work_type: c,
              },
            ),
          ),
        );
      }
      this.casesToAdd = [];
      this.showAddCasesModal = false;
      this.currentCaseSearch = null;
      this.getClaimedWorksites();
      this.$emit('reload');
    },
    async removeFromTeam(userId) {
      const newUsers = this.team.users.filter((id) => id !== userId);
      Team.update({
        where: this.team.id,
        data: {
          users: newUsers,
        },
      });
      await this.updateCurrentTeam();
      this.$emit('reload');
    },
    async moveToDifferentTeam(userId) {
      const result = await this.$selection({
        title: this.$t('teams.move_teams'),
        content: '',
        label: 'name',
        options: this.teams.filter((t) => t.id !== this.team.id),
        placeholder: this.$t('teams.select_target_team'),
      });
      if (result.id) {
        await this.removeFromTeam(userId);
        result.users.push(userId);
        await this.updateTeam(result.id, result.$toJson());
        this.$emit('reload');
      }
    },
    async deleteCurrentTeam() {
      const result = await this.$confirm({
        title: this.$t('teams.delete_team'),
        content: this.$t('teams.delete_team_confirm'),
        actions: {
          no: {
            text: this.$t('teams.no'),
            type: 'outline',
            buttonClass: 'border border-black',
          },
          yes: {
            text: this.$t('teams.yes'),
            type: 'solid',
          },
        },
      });
      if (result === 'no' || result === 'cancel') {
        return;
      }

      await Team.api().delete(`/teams/${this.team.id}`, {
        delete: this.team.id,
      });
      this.$emit('reload');
      await this.$router.push('/organization/teams');
    },
    async showOnMap(worksite) {
      const workType = Worksite.getWorkType(
        worksite.work_types,
        null,
        this.currentUser.organization,
      );
      await this.$component({
        title: this.$t('teams.view_case'),
        component: 'WorkTypeMap',
        classes: 'w-full h-96',
        props: {
          workTypes: [{ ...workType, location: worksite.location }],
        },
      });
    },
    async statusValueChange(value, workType, worksiteId) {
      try {
        await Worksite.api().updateWorkTypeStatus(workType.id, value);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        await Worksite.api().fetch(worksiteId);
      }
    },
    async showAllOnMap() {
      await this.$component({
        title: this.$t('teams.view_all_cases'),
        component: 'WorkTypeMap',
        classes: 'w-full h-96',
        props: {
          workTypes: this.assignedWorksites.map((worksite) => {
            const workType = Worksite.getWorkType(
              worksite.work_types,
              null,
              this.currentUser.organization,
            );
            return { ...workType, location: worksite.location };
          }),
        },
      });
    },
  },
  computed: {
    team() {
      return Team.find(this.$route.params.team_id);
    },
    selectableWorksites() {
      return this.worksites.filter(
        (w) => !this.assignedWorksites.map((ws) => ws.id).includes(w.id),
      );
    },
    mapWorkTypes() {
      return this.selectableWorksites.map((worksite) => {
        const workType = Worksite.getWorkType(
          worksite.work_types,
          null,
          this.currentUser.organization,
        );
        return { ...workType, location: worksite.location };
      });
    },
    assignedWorksites() {
      return Worksite.query()
        .where((worksite) => {
          return this.workTypes
            .filter((wt) => {
              return this.team.assigned_work_types
                .map((awt) => awt.id)
                .includes(wt.id);
            })
            .map((awt) => awt.case_number)
            .includes(worksite.case_number);
        })
        .get();
    },
    allTeamUsers: {
      get() {
        return this.team && this.team.users.map((u) => this.getUser(u));
      },
      set(newValue) {
        Team.update({
          where: this.team.id,
          data: {
            users: newValue.map((u) => u.id),
          },
        });
      },
    },
    ...mapState('incident', ['currentIncidentId']),
  },
};
</script>

<style>
.team-detail-user-bp__btn--active {
  background: #fff;
}

.team-detail-user-bp__btn {
  @apply border-0;
}
</style>
