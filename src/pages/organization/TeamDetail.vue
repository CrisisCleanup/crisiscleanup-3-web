<template>
  <div class="bg-white h-full h-84">
    <div class="flex justify-between">
      <div
        class="font-semibold flex justify-between items-center h-12 px-3"
        v-if="team"
      >
        {{ team.name }}
      </div>
      <div class="flex flex-wrap items-center justify-end">
        <ccu-icon
          :alt="$t('actions.jump_to_case')"
          size="small"
          class="p-2"
          type="go-case"
          @click.native="showAllOnMap"
        />
        <ccu-icon
          :alt="$t('actions.delete')"
          type="trash"
          class="p-2"
          size="small"
          @click.native="
            () => {
              deleteCurrentTeam();
            }
          "
        />
        <img
          :alt="$t('actions.rename_team')"
          src="@/assets/icons/edit.svg"
          class="cursor-pointer p-2"
          @click="showRenameModal = true"
        />
      </div>
    </div>
    <tabs class="w-full" ref="tabs">
      <tab :name="`${$t('teams.manage_users')} (${allTeamUsers.length})`">
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
          <div>
            <base-button
              variant="outline"
              class="px-2 py-1"
              :text="$t('teams.remove_from_team')"
              :disabled="selectedUsers.length === 0"
              :action="
                () => {
                  removeFromTeam([...selectedUsers]);
                  selectedUsers = [];
                }
              "
            ></base-button>
          </div>
        </div>
        <div class="mt-2">
          <Table
            :columns="[
              {
                title: '',
                dataIndex: 'name',
                key: 'name',
                width: '25%',
              },
              {
                title: $t(''),
                dataIndex: 'email',
                key: 'email',
                width: '32%',
              },
              {
                title: $t(''),
                dataIndex: 'phone1',
                key: 'phone1',
                width: '30%',
              },
              {
                title: $t(''),
                dataIndex: 'actions',
                key: 'actions',
                width: '10%',
              },
            ]"
            :data="allTeamUsers"
            enable-selection
            @selectionChanged="
              (selectedItems) => {
                selectedUsers = Array.from(selectedItems);
              }
            "
            :body-style="{ height: '300px' }"
          >
            <template #name="slotProps">
              <div class="flex items-center">
                <Avatar
                  :initials="slotProps.item.first_name"
                  :url="slotProps.item.profilePictureUrl"
                  classes="mb-1"
                  size="xsmall"
                />
                <span class="ml-2">{{ slotProps.item.full_name }}</span>
              </div>
            </template>
            <template #email="slotProps">
              <span>
                <font-awesome-icon icon="envelope" />
                {{ slotProps.item.email }}
              </span>
            </template>
            <template #phone1="slotProps">
              <span>
                <font-awesome-icon icon="phone" />
                {{ slotProps.item.mobile }}
              </span>
            </template>
            <template #actions="slotProps">
              <div style="margin-top: 2px" class="flex justify-end">
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
                        class="
                          py-2
                          cursor-pointer
                          hover:bg-crisiscleanup-light-grey
                        "
                      >
                        <font-awesome-icon icon="envelope"></font-awesome-icon>
                        <a :href="`mailto:${slotProps.item.email}`">{{
                          $t('teams.send_email')
                        }}</a>
                      </li>
                      <li
                        class="
                          py-2
                          cursor-pointer
                          hover:bg-crisiscleanup-light-grey
                        "
                      >
                        <font-awesome-icon icon="user"></font-awesome-icon>
                        <a :href="`/organization/users/${slotProps.item.id}`">
                          {{ $t('teams.view_full_profile') }}
                        </a>
                      </li>
                      <li
                        class="
                          py-2
                          cursor-pointer
                          hover:bg-crisiscleanup-light-grey
                        "
                        @click="
                          () => {
                            moveToDifferentTeam(slotProps.item.id);
                          }
                        "
                      >
                        <font-awesome-icon icon="pen"></font-awesome-icon>
                        {{ $t('teams.move_to_another_team') }}
                      </li>
                      <li
                        class="
                          py-2
                          cursor-pointer
                          hover:bg-crisiscleanup-light-grey
                        "
                        @click="
                          () => {
                            removeFromTeam(slotProps.item.id);
                          }
                        "
                      >
                        <font-awesome-icon icon="trash"></font-awesome-icon>
                        {{ $t('teams.remove_from_team') }}
                      </li>
                    </ul>
                  </template>
                </base-dropdown>
              </div>
            </template>
          </Table>
        </div>
      </tab>
      <tab :name="`${$t('teams.manage_cases')} (${assignedWorksites.length})`">
        <div class="flex items-center justify-between py-2">
          <base-button
            class="my-1 text-primary-dark"
            type="link"
            :text="$t('teams.assigned_claimed_cases_plus')"
            :alt="$t('teams.assigned_claimed_cases_plus')"
            :action="
              () => {
                showAddCasesModal = true;
              }
            "
          />
          <base-button
            variant="outline"
            class="px-2 py-1"
            :text="$t('teams.remove_from_team')"
            :disabled="selectedWorksites.length === 0"
            :action="
              () => {
                Promise.all(
                  selectedWorksites.map((id) => removeWorksiteFromTeam(id)),
                );
              }
            "
          ></base-button>
        </div>
        <div class="flex" style="min-width: 80px">
          <ccu-icon
            :alt="$t('casesVue.map_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingWorksiteMap ? 'filter-yellow' : 'filter-gray'"
            type="map"
            @click.native="toggleView('showingWorksiteMap')"
            data-cy="cases.mapButton"
          />
          <ccu-icon
            :alt="$t('casesVue.table_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingWorksiteTable ? 'filter-yellow' : 'filter-gray'"
            type="table"
            @click.native="toggleView('showingWorksiteTable')"
            data-cy="cases.tableButton"
          />
        </div>
        <div class="mt-2">
          <Table
            v-if="showingWorksiteTable"
            :columns="[
              {
                title: '',
                dataIndex: 'case_number',
                key: 'case_number',
                width: '7%',
              },
              {
                title: $t(''),
                dataIndex: 'work_types',
                key: 'work_types',
                width: '20%',
              },
              {
                title: $t(''),
                dataIndex: 'name',
                key: 'name',
                width: '15%',
              },
              {
                title: $t(''),
                dataIndex: 'full_address',
                key: 'full_address',
                width: '30%',
              },
              {
                title: $t(''),
                dataIndex: 'phone1',
                key: 'phone1',
                width: '15%',
              },
              {
                title: $t(''),
                dataIndex: 'actions',
                key: 'actions',
                width: '10%',
              },
            ]"
            :body-style="{ height: '300px' }"
            :data="assignedWorksites"
            enable-selection
            @selectionChanged="
              (selectedItems) => {
                selectedWorksites = Array.from(selectedItems);
              }
            "
          >
            <template #case_number="slotProps">
              <div class="flex items-center">
                <span class="ml-2">{{ slotProps.item.case_number }}</span>
              </div>
            </template>
            <template #work_types="slotProps">
              <div class="flex flex-wrap w-full">
                <div
                  v-for="work_type in slotProps.item.work_types"
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
                        statusValueChange(value, work_type, slotProps.item.id);
                      }
                    "
                  />
                </div>
              </div>
            </template>
            <template #actions="slotProps">
              <div class="flex items-start">
                <ccu-icon
                  :alt="$t('actions.jump_to_case')"
                  size="small"
                  class="p-1 py-2"
                  type="go-case"
                  @click.native="
                    () => {
                      showOnMap(slotProps.item);
                    }
                  "
                />
              </div>
              <div style="margin-top: 2px" class="flex justify-end">
                <base-dropdown
                  :trigger="'click'"
                  class-name="team-detail-case"
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
                        class="
                          py-2
                          cursor-pointer
                          hover:bg-crisiscleanup-light-grey
                        "
                        @click="
                          () => {
                            removeWorksiteFromTeam(slotProps.item.id);
                          }
                        "
                      >
                        {{ $t('teams.remove_from_team') }}
                      </li>
                    </ul>
                  </template>
                </base-dropdown>
              </div>
            </template>
          </Table>
          <WorkTypeMap
            v-if="showingWorksiteMap"
            class="w-full h-96"
            :work-types="mapAssingedWorkTypes"
            :polygon="caseArea"
          ></WorkTypeMap>
        </div>
      </tab>
      <tab :name="$t('teams.notes')">
        <base-input
          :value="team.notes"
          text-area
          :rows="4"
          :placeholder="$t('teams.notes')"
          @input="updateNotes"
          @blur="updateCurrentTeam"
        />
      </tab>
    </tabs>

    <modal
      v-if="showAddMembersModal"
      :title="$t('teams.add_members')"
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
            :key="`${user.id}`"
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
                  class="mr-2 mb-4"
                  size="xsmall"
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
      :title="$t('teams.assign_cases')"
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
              v-for="worksite in assignableWorksites"
              :key="`${worksite.id}`"
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
    <modal
      v-if="showRenameModal"
      closeable
      :title="$t('actions.rename_team')"
      @close="renameTeam"
      modal-classes="max-w-xl"
    >
      <base-input
        v-model="team.name"
        :placeholder="$t('teams.name')"
        class="w-64 m-6"
      />
    </modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as L from 'leaflet';
import Team from '@/models/Team';
import Worksite from '@/models/Worksite';
import { UserMixin, DialogsMixin } from '@/mixins';
import Avatar from '../../components/Avatar';
import { getColorForStatus } from '../../filters';
import WorksiteStatusDropdown from '../../components/WorksiteStatusDropdown';
import { getErrorMessage } from '../../utils/errors';
import WorkTypeMap from '../../components/WorkTypeMap';
import { getQueryString } from '../../utils/urls';
import Table from '../../components/Table';

export default {
  name: 'TeamDetail',
  components: { Table, WorkTypeMap, WorksiteStatusDropdown, Avatar },
  mixins: [UserMixin, DialogsMixin],
  async mounted() {
    await Team.api().get(`/teams/${this.$route.params.team_id}`);
    const feature = await Team.api().getCasesArea(
      this.$route.params.team_id,
      this.currentIncidentId,
    );
    const geojsonFeature = {
      type: 'Feature',
      properties: {},
      geometry: feature.response.data,
    };
    this.caseArea = L.geoJSON(geojsonFeature, {
      weight: '1',
    });
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
      Promise,
      getColorForStatus,
      currentUsers: [],
      userResults: [],
      caseResults: [],
      usersToAdd: [],
      casesToAdd: [],
      worksites: [],
      selectedUsers: [],
      selectedWorksites: [],
      showAddMembersModal: false,
      showAddCasesModal: false,
      showRenameModal: false,
      showingWorksiteTable: true,
      showingWorksiteMap: false,
      caseArea: null,
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
    async renameTeam() {
      Team.update({
        where: this.team.id,
        data: {
          name: this.team.name,
        },
      });
      await this.updateCurrentTeam();
      this.showRenameModal = false;
    },
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
    async getWorksite(id) {
      const {
        response: { data },
      } = await Worksite.api().get(`/worksites/${id}`);
      return data;
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
    async removeFromTeam(userIds) {
      const newUsers = this.team.users.filter((id) => !userIds.includes(id));
      Team.update({
        where: this.team.id,
        data: {
          users: newUsers,
        },
      });
      await this.updateCurrentTeam();
      this.$emit('reload');
    },
    async removeWorksiteFromTeam(worksiteId) {
      const worksite = await this.getWorksite(worksiteId);

      const ids = worksite.work_types
        .filter((type) => type.claimed_by === this.currentUser.organization.id)
        .map((wt) => wt.id);

      const workTypesToDelete = this.team.assigned_work_types.filter((awt) =>
        ids.includes(awt.id),
      );
      await Promise.all(
        workTypesToDelete.map((wt) => {
          return this.$http.delete(
            `${process.env.VUE_APP_API_BASE_URL}/worksite_work_types_teams/${wt.id}`,
            {
              data: { team: this.team.id },
            },
          );
        }),
      );

      this.$emit('reload');
    },
    toggleView(view) {
      this.showingWorksiteTable = false;
      this.showingWorksiteMap = false;
      this[view] = true;
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
        await this.removeFromTeam([userId]);
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
            text: this.$t('actions.cancel'),
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
    assignableWorksites() {
      return this.worksites.filter(
        (w) => !this.assignedWorksites.map((ws) => ws.id).includes(w.id),
      );
    },
    mapWorkTypes() {
      return this.assignableWorksites.map((worksite) => {
        const workType = Worksite.getWorkType(
          worksite.work_types,
          null,
          this.currentUser.organization,
        );
        return { ...workType, location: worksite.location };
      });
    },
    mapAssingedWorkTypes() {
      return this.assignedWorksites.map((worksite) => {
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

.team-detail-case-bp__btn--active {
  background: #fff;
}

.team-detail-case-bp__btn {
  @apply border-0;
}
</style>
