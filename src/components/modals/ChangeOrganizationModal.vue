<template>
  <modal
    modal-classes="bg-white max-w-2xl shadow"
    :closeable="true"
    @close="$emit('cancel')"
  >
    <div slot="header" class="text-lg border-b p-3">
      {{ $t('userTransfer.change_organization') }}
    </div>
    <div v-if="loading" class="flex h-full items-center justify-center">
      <font-awesome-icon size="xl" icon="spinner" spin />
    </div>
    <div v-else class="p-3">
      <div v-if="page === 'start'">
        <base-text variant="h2" :weight="400" class="text-center">
          {{ $t('userTransfer.where_move_to') }}
        </base-text>
        <div class="flex justify-center text-base my-10">
          <div
            class="h-40 w-40 mx-4 border p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-crisiscleanup-light-grey hidden"
            @click="page = 'new'"
          >
            {{ $t('userTransfer.move_new_organization') }}
            <ccu-icon
              size="lg"
              type="right"
              class="mt-3"
              :alt="$t('userTransfer.move_new_organization')"
            />
          </div>
          <div
            class="h-40 w-40 mx-4 border p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-crisiscleanup-light-grey"
            @click="page = 'existing'"
          >
            {{ $t('userTransfer.move_existing_organization') }}
            <ccu-icon
              size="lg"
              type="right"
              class="mt-3"
              :alt="$t('userTransfer.move_existing_organization')"
            />
          </div>
        </div>
      </div>

      <div v-if="page === 'existing'">
        <tabs ref="tabs" class="">
          <tab :name="$t('userTransfer.select_organization')">
            <div class="text-base mt-1 mb-3">
              {{ $t('userTransfer.please_select_target_organization') }}
            </div>
            <OrganizationSearchInput
              class="w-108"
              size="large"
              @selectedOrganization="selectedOrganization = $event"
            />
          </tab>
          <tab
            :name="$t('userTransfer.select_users')"
            :disabled="!selectedOrganization"
          >
            <div class="h-72 overflow-auto py-2">
              <div class="pb-2">
                {{ $t('userTransfer.select_users') }}
                {{ selectedOrganization && selectedOrganization.name }}
              </div>
              <base-checkbox class="pb-2" @input="setAllUsers">{{
                $t('actions.select_all')
              }}</base-checkbox>
              <tree-menu
                v-for="user in nestedUsers"
                :key="`${user.id}`"
                :children="user.children"
                :label="user.label"
                :data="user"
                :indent="0"
                :selected-users="selectedUsers"
                @addUser="addUser"
                @removeUser="removeUser"
                @addUserTree="addUserTree"
                @removeUserTree="removeUserTree"
              ></tree-menu>
            </div>
          </tab>
          <tab
            :name="$t('userTransfer.select_cases')"
            :disabled="!selectedOrganization"
          >
            <div class="h-72 overflow-auto py-2">
              <div class="pb-2">
                {{ $t('userTransfer.select_cases') }}
                <div class="">
                  <div
                    v-for="(cases, incident) in claimedCases"
                    :key="incident"
                    class="py-2 border-b"
                  >
                    <div class="text-base py-2">
                      {{ getIncidentName(incident, incidents) }}
                    </div>
                    <base-checkbox
                      class="pb-2"
                      @input="
                        (value) => {
                          setCases(value, cases);
                        }
                      "
                      >{{ $t('actions.select_all') }}
                      {{ getIncidentName(incident, incidents) }}
                      {{ $t('userTransfer.cases') }}</base-checkbox
                    >
                    <div
                      v-for="work_type in cases"
                      :key="`${work_type.id}`"
                      class="border-t py-1"
                    >
                      <base-checkbox
                        class="pb-2"
                        :value="selectedCases.includes(work_type.id)"
                        @input="
                          (value) => {
                            setCases(value, [work_type]);
                          }
                        "
                      >
                        <div class="badge-holder flex items-center">
                          <badge
                            class="ml-1 mr-3"
                            :color="
                              getColorForStatus(
                                work_type.status,
                                Boolean(work_type.claimed_by),
                              )
                            "
                          />
                          <span class="mr-2">{{ work_type.case_number }}</span>
                          <span>{{
                            getWorkTypeName(work_type.work_type)
                          }}</span>
                        </div>
                      </base-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </tab>
        </tabs>
      </div>
    </div>
    <div slot="footer" class="flex items-center justify-center py-2 border-t">
      <base-button
        v-if="page === 'start'"
        :text="$t('actions.cancel')"
        :alt="$t('actions.cancel')"
        variant="outline"
        class="px-6 p-3"
        :action="
          () => {
            $emit('cancel');
          }
        "
      >
        {{ $t('actions.cancel') }}
      </base-button>
      <base-button
        v-if="page !== 'start'"
        :text="$t('actions.back')"
        :alt="$t('actions.back')"
        variant="outline"
        class="px-6 p-3 mx-2 w-24"
        :action="
          () => {
            if (tabs) {
              tabs.previousTab();
            }
          }
        "
      >
        {{ $t('actions.back') }}
      </base-button>
      <base-button
        v-if="page !== 'start' && tabs && !tabs.isLast"
        :text="$t('actions.next')"
        :alt="$t('actions.next')"
        variant="solid"
        class="px-6 p-3 mx-2 w-24"
        :action="
          () => {
            if (tabs) {
              tabs.nextTab();
            }
          }
        "
      >
        {{ $t('actions.next') }}
      </base-button>
      <base-button
        v-if="tabs && tabs.isLast"
        :text="$t('actions.move')"
        :alt="$t('actions.move')"
        variant="solid"
        class="px-6 p-3 mx-2 w-24"
        :action="transferRequest"
      >
        {{ $t('actions.move') }}
      </base-button>
    </div>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { hash } from '@/utils/promise';
import { nestUsers } from '@/utils/form';
import User from '@/models/User';
import { groupBy } from '@/utils/array';
import { getColorForStatus, getWorkTypeName } from '@/filters';
import useCurrentUser from '@/hooks/useCurrentUser';
import OrganizationSearchInput from '@/components/OrganizationSearchInput.vue';
import type Incident from '@/models/Incident';

export default defineComponent({
  name: 'ChangeOrganizationModal',
  components: { OrganizationSearchInput },

  setup(props, context) {
    const { currentUser } = useCurrentUser();
    const $http = axios;

    const page = ref('start');
    const lineageUsers = ref([]);
    const incidents = ref([]);
    const nestedUsers = ref([]);
    const claimedCases = ref({});
    const selectedOrganization = ref<any | null>(null);
    const tabs = ref(null);
    const loading = ref(false);
    const isMounted = ref(false);
    const selectedUsers = ref<any | null>([]);
    const selectedCases = ref<any | null>([]);

    async function loadPageData() {
      const pageData = await hash({
        lineageUsers: User.api().get(
          `/users?lineage=${currentUser?.id}&limit=1000&fields=id,referring_user,first_name,last_name,files,lineage&organization=${currentUser?.organization?.id}`,
          {
            dataKey: 'results',
          },
        ),
        incidents: $http.get(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/incidents?fields=id,name,short_name,geofence,locations,turn_on_release&limit=200&sort=-start_at`,
        ),
      });
      lineageUsers.value = pageData.lineageUsers.entities.users;
      incidents.value = pageData.incidents.data.results;
      if (lineageUsers.value && lineageUsers.value.length > 0) {
        nestedUsers.value = nestUsers(lineageUsers.value, currentUser?.id);

        const user_ids = lineageUsers.value.map((user: User) => user.id);
        if (currentUser?.id) {
          user_ids.push(currentUser?.id);
        }
      }
      const response = await $http.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/worksite_work_types?claimed_by=${
          currentUser?.organization.id
        }&limit=150`,
      );
      claimedCases.value = groupBy(response.data.results, 'incident');
    }
    function setTabs(newTabs: null) {
      tabs.value = newTabs;
    }
    async function transferRequest() {
      await $http.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/transfer_requests`,
        {
          transfering_user_ids: [...selectedUsers.value],
          transfering_wwwtsp_ids: selectedCases.value,
          origin_organization: currentUser?.organization.id,
          target_organization: selectedOrganization.value?.id,
          user_notes: '',
        },
      );
      context.emit('cancel');
    }
    function setAllUsers(value: boolean) {
      if (value) {
        const user_ids = lineageUsers.value.map((user: User) => user.id);
        selectedUsers.value = [...user_ids];
      } else {
        selectedUsers.value = [];
      }
    }
    function setCases(value: boolean, cases: any[]) {
      const caseIds = cases.map((c: { id: string }) => c.id);
      if (value) {
        selectedCases.value = [...selectedCases.value, ...caseIds];
      } else {
        selectedCases.value = selectedCases.value.filter(
          (id: string) => !caseIds.includes(id),
        );
      }
    }
    function addUser(userId: string) {
      selectedUsers.value.push(userId);
    }
    function removeUser(userId: string) {
      selectedUsers.value = selectedUsers.value.filter(
        (id: string) => id !== userId,
      );
    }
    function addUserTree(userId: string) {
      const userLineage = lineageUsers.value.filter((user: User) =>
        user.lineage.includes(userId),
      );
      selectedUsers.value.push(...userLineage.map((user: User) => user.id));
    }
    function removeUserTree(userId: string) {
      const userLineageIds = new Set(
        lineageUsers.value
          .filter((user: User) => user.lineage.includes(userId))
          .map((user: User) => user.id),
      );
      selectedUsers.value = selectedUsers.value.filter(
        (id: string) => !userLineageIds.has(id),
      );
    }
    function getIncidentName(value: string, incident_list: Incident[]) {
      return (
        incident_list.length > 0 &&
        incident_list.find((c) => Number(c.id) === Number(value))?.name
      );
    }
    onMounted(async () => {
      loading.value = true;
      await loadPageData();
      loading.value = false;
      isMounted.value = true;
    });

    return {
      page,
      tabs,
      lineageUsers,
      incidents,
      nestedUsers,
      claimedCases,
      selectedOrganization,
      loading,
      isMounted,
      selectedUsers,
      selectedCases,
      loadPageData,
      setTabs,
      transferRequest,
      setAllUsers,
      setCases,
      addUser,
      removeUser,
      addUserTree,
      removeUserTree,
      getColorForStatus,
      getWorkTypeName,
      getIncidentName,
    };
  },
});
</script>

<style scoped></style>
