<template>
  <div class="bg-white px-5 h-full h-84">
    <div class="flex justify-between border-b py-1">
      <div class="font-semibold flex justify-between items-center h-16">
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
    <div class="px-3 py-1">
      <div class="flex items-center justify-between py-2">
        <base-text>{{ $t('teams.list_of_members') }}</base-text>
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
              <ccu-icon :alt="$t('actions.drag')" size="medium" type="drag" />
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

      <div class="flex items-center justify-between py-2">
        <base-text>{{ $t('teams.list_of_cases') }}</base-text>
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
      <div class="mt-2 h-40 overflow-auto">
        <draggable
          v-model="cases"
          :options="{ group: 'cases' }"
          @start="drag = true"
          @end="drag = false"
          handle=".handle"
          class="overflow-auto"
        >
          <div
            v-for="work_type in cases"
            :key="work_type.id"
            class="border-t last:border-b py-3 bg-white"
            style="
              display: grid;
              grid-template-columns: 25px 20% 20% 20% 20% 25px;
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
            <span>{{ work_type.name }}</span>
            <span>
              <font-awesome-icon icon="phone" />
              {{ work_type.phone1 }}
            </span>
            <ccu-icon
              :alt="$t('actions.jump_to_case')"
              size="small"
              class="p-1 py-2"
              type="go-case"
              @click.native="
                () => {
                  showOnMap(work_type);
                }
              "
            />
          </div>
        </draggable>
      </div>

      <textarea
        :value="team.notes"
        class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-4 resize-none w-full"
        rows="4"
        :placeholder="$t('teams.notes')"
        @input="updateNotes"
        @blur="updateCurrentTeam"
      />
    </div>

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
      title="Assign Cases"
      closeable
      @close="showAddCasesModal = false"
      modal-classes="max-w-xl"
    >
      <div class="px-5 py-2">
        <div class="py-2">
          {{ $t('teams.choose_cases') }}
        </div>
        <base-input
          v-model="currentCaseSearch"
          icon="search"
          class="w-64 mr-4 mb-6"
          :placeholder="$t('actions.search')"
          @input="onCaseSearch"
        ></base-input>
        <div class="h-64 overflow-auto">
          <div
            v-for="work_type in caseResults"
            :key="work_type.id"
            class="border-t last:border-b py-3 px-3 bg-white"
            style="
              display: grid;
              grid-template-columns: 25px max-content 1fr;
              grid-gap: 10px;
            "
          >
            <base-checkbox
              :value="casesToAdd.includes(work_type.id)"
              @input="
                (value) => {
                  if (value) {
                    casesToAdd.push(work_type.id);
                  } else {
                    casesToAdd = casesToAdd.filter((id) => id !== work_type.id);
                  }
                }
              "
            />
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
        </div>
      </div>
      <div slot="footer" class="p-3 flex items-center justify-center">
        <base-button
          :action="
            () => {
              showAddCasesModal = false;
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
import { UserMixin, DialogsMixin } from '@/mixins';
import draggable from 'vuedraggable';
import { mapState } from 'vuex';
import Avatar from '../../components/Avatar';
import { getColorForStatus } from '../../filters';

export default {
  name: 'TeamDetail',
  components: { Avatar, draggable },
  mixins: [UserMixin, DialogsMixin],
  async mounted() {
    await Team.api().get(`/teams/${this.$route.params.team_id}`);
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
    updateNotes(event) {
      Team.update({
        where: this.team.id,
        data: {
          notes: event.target.value,
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
    async showOnMap(work_type) {
      await this.$component({
        title: this.$t('teams.view_case'),
        component: 'WorkTypeMap',
        classes: 'w-full h-96',
        props: {
          workTypes: [work_type],
        },
      });
    },
    async showAllOnMap() {
      await this.$component({
        title: this.$t('teams.view_all_cases'),
        component: 'WorkTypeMap',
        classes: 'w-full h-96',
        props: {
          workTypes: this.cases,
        },
      });
    },
  },
  computed: {
    team() {
      return Team.find(this.$route.params.team_id);
    },
    cases() {
      return this.workTypes.filter((wt) => {
        return this.team.assigned_work_types
          .map((awt) => awt.id)
          .includes(wt.id);
      });
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
