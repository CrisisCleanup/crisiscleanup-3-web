<template>
  <div v-if="worksite" class="bg-white flex flex-col flex-grow">
    <div class="p-3 flex-grow intake-view">
      <div class="my-4">
        <label
          v-if="worksite.notes && worksite.notes.length > 0"
          class="my-1 text-xs font-bold text-gray-600 block"
          >{{ $t('formLabels.notes') }}</label
        >
        <div
          v-for="note in worksite.notes"
          :key="note.id"
          class="notes my-1 p-1 flex items-center"
        >
          <span class="text-gray-600 mr-3 notes-time"
            >{{ note.created_at | moment('from', 'now') }}:</span
          ><span class="font-hairline">{{ note.note }}</span>
        </div>
        <base-button
          v-if="!addingNotes"
          class="my-1"
          type="link"
          :text="$t('+ Add Note')"
          :alt="$t('Add Note')"
          :action="
            () => {
              this.addingNotes = true;
            }
          "
        />
        <div v-if="addingNotes">
          Note
          <a-textarea v-model="currentNote" rows="4" />
          <div class="flex items-center justify-between">
            <base-button
              class="my-1"
              type="bare"
              :text="$t('actions.cancel')"
              :action="cancelNote"
            />
            <base-button
              class="my-1"
              type="link"
              :alt="$t('actions.save')"
              :action="saveNote"
            />
          </div>
        </div>
      </div>
      <div class="my-4">
        <label class="my-1 text-xs font-bold text-gray-600 block">{{
          $t('formLabels.address')
        }}</label>
        <div>{{ worksiteAddress }}</div>
      </div>
      <div v-if="Object.keys(workTypesClaimedByOthers).length > 0" class="my-4">
        <label class="my-1 text-xs font-bold text-gray-600 block">{{
          $t('searchFilterAside.claimed_by')
        }}</label>
        <div
          v-for="organization in Object.keys(workTypesClaimedByOthers)"
          class="my-1"
        >
          {{ getOrganizationName(organization) }}
        </div>
      </div>

      <div class="my-4 border-t">
        <div
          v-if="Object.keys(workTypesClaimedByOthers).length > 0"
          class="my-4"
        >
          <div v-for="(work_types, organization) in workTypesClaimedByOthers">
            <label class="my-4 text-xs font-bold text-gray-600"
              >{{ $t('searchFilterAside.claimed_by') }}
              {{ getOrganizationName(organization) }}</label
            >
            <template v-for="work_type in work_types">
              <div :key="work_type.id" class="work_type_section">
                <span class="text-sm">{{
                  work_type.work_type | getWorkTypeName
                }}</span>
                <StatusDropDown
                  class="block"
                  :current-work-type="work_type"
                  :on-select="
                    value => {
                      statusValueChange(value, work_type);
                    }
                  "
                />
                <base-button
                  type="link"
                  :action="
                    () => {
                      return requestWorkType(work_type);
                    }
                  "
                  :text="$t('actions.request')"
                  class="ml-2 p-1 px-3 text-xs"
                />
              </div>
            </template>
          </div>
        </div>
        <div v-if="workTypesClaimedByOrganization.length > 0" class="my-4">
          <label class="my-4 text-xs font-bold text-gray-600">{{
            $t('Claimed By My Organization')
          }}</label>
          <template v-for="work_type in workTypesClaimedByOrganization">
            <div :key="work_type.id" class="work_type_section">
              <span class="text-sm">{{
                work_type.work_type | getWorkTypeName
              }}</span>
              <StatusDropDown
                class="block"
                :current-work-type="work_type"
                :on-select="
                  value => {
                    statusValueChange(value, work_type);
                  }
                "
              />
              <base-button
                type="primary"
                :action="
                  () => {
                    return unclaimWorkType(work_type);
                  }
                "
                :text="$t('actions.unclaim')"
                class="ml-2 p-1 px-3 text-xs"
              />
            </div>
          </template>
        </div>
        <div v-if="workTypesUnclaimed.length > 0" class="my-4">
          <label class="my-4 text-xs font-bold text-gray-600">{{
            $t('Unclaimed Work Types')
          }}</label>
          <template v-for="work_type in workTypesUnclaimed">
            <div :key="work_type.id" class="work_type_section">
              <span class="text-sm">{{
                work_type.work_type | getWorkTypeName
              }}</span>
              <StatusDropDown
                class="block"
                :current-work-type="work_type"
                :on-select="
                  value => {
                    statusValueChange(value, work_type);
                  }
                "
              />
              <base-button
                type="primary"
                :action="
                  () => {
                    return claimWorkType(work_type);
                  }
                "
                :text="$t('actions.claim')"
                class="ml-2 p-1 px-3 text-xs"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
    <div
      class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-center items-center"
    >
      <base-button
        v-if="workTypesClaimedByOrganization.length > 0"
        size="medium"
        class="m-1 text-black p-3 px-4 border-2 border-black"
        :text="$t('actions.unclaim')"
        :action="
          () => {
            return unclaimWorkType();
          }
        "
      />
      <base-button
        v-if="workTypesUnclaimed.length > 0"
        size="medium"
        type="primary"
        class="m-1 text-black p-3 px-4"
        :text="$t('actions.claim')"
        :action="
          () => {
            return claimWorkType();
          }
        "
      />
      <base-button
        v-if="Object.keys(workTypesClaimedByOthers).length > 0"
        size="medium"
        class="m-1 text-black p-3 px-4 border-2 border-black"
        :text="$t('actions.request')"
        :action="
          () => {
            return requestWorkType();
          }
        "
      />
      <base-button
        size="medium"
        type="primary"
        class="m-1 text-black p-3 px-4"
        :text="$t('actions.done')"
        :action="
          () => {
            $emit('closeWorksite');
          }
        "
      />
    </div>
  </div>
  <a-skeleton v-else class="bg-white h-full p-3 flex-grow" active />
</template>

<script>
import { getErrorMessage } from '@/utils/errors';
import StatusDropDown from '@/components/StatusDropDown';
import User from '@/models/User';
import Worksite from '@/models/Worksite';
import { groupBy } from '@/utils/array';
import Organization from '@/models/Organization';

export default {
  name: 'CaseView',
  components: { StatusDropDown },
  data() {
    return {
      addingNotes: false,
      currentNote: '',
    };
  },
  computed: {
    worksite() {
      return Worksite.find(this.$route.params.id);
    },
    workTypesClaimedByOrganization() {
      if (this.worksite) {
        return this.worksite.work_types.filter(
          type => type.claimed_by === this.currentUser.organization.id,
        );
      }
      return [];
    },
    workTypesClaimedByOthers() {
      if (this.worksite) {
        const list = this.worksite.work_types.filter(
          type =>
            type.claimed_by &&
            type.claimed_by !== this.currentUser.organization.id,
        );
        return groupBy(list, 'claimed_by');
      }
      return [];
    },
    workTypesUnclaimed() {
      if (this.worksite) {
        return this.worksite.work_types.filter(
          type => type.claimed_by === null,
        );
      }
      return [];
    },
    worksiteAddress() {
      if (this.worksite) {
        const { address, city, state, postal_code } = this.worksite;
        return `${address}, ${city}, ${state} ${postal_code}`;
      }
      return '';
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  async mounted() {
    try {
      await Worksite.api().fetch(
        this.$route.params.id,
        this.$route.params.incident_id,
      );
    } catch (e) {
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases`,
      );
    }
    if (this.$route.query.showOnMap) {
      this.$emit('jumpToCase', this.$route.params.id);
    }
  },
  methods: {
    async claimWorkType(work_type) {
      try {
        const work_types = [];
        if (work_type) {
          work_types.push(work_type.work_type);
        }
        await Worksite.api().claimWorksite(this.worksite.id, work_types);
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      }
    },
    async unclaimWorkType(work_type) {
      try {
        const work_types = [];
        if (work_type) {
          work_types.push(work_type.work_type);
        }
        await Worksite.api().unclaimWorksite(this.worksite.id, work_types);
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      }
    },
    async requestWorkType(work_type) {
      try {
        const work_types = [];
        if (work_type) {
          work_types.push(work_type.work_type);
        }
        await Worksite.api().requestWorksite(this.worksite.id, work_types);
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      }
    },
    async saveNote() {
      try {
        await Worksite.api().addNote(this.worksite.id, this.currentNote);
        this.addingNotes = false;
        this.currentNote = '';
        await Worksite.api().fetch(this.worksite.id);
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      }
    },
    cancelNote() {
      this.addingNotes = false;
      this.currentNote = '';
    },
    getOrganizationName(id) {
      const organization = Organization.find(id);
      if (organization) {
        return organization.name;
      }
      return '';
    },
    async statusValueChange(value, work_type) {
      try {
        await Worksite.api().updateWorkTypeStatus(work_type.id, value);
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      } finally {
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
      }
    },

    getFieldsForType(work_type) {
      if (this.incident) {
        const available_fields = this.worksite.form_data.map(
          data => data.field_key,
        );
        const fields = this.incident.form_fields.filter(field => {
          const parent = this.incident.form_fields.find(element => {
            return element.field_key === field.field_parent_key;
          });

          let { if_selected_then_work_type } = field;
          if (parent) {
            if_selected_then_work_type = parent.if_selected_then_work_type;
          }

          return (
            if_selected_then_work_type === work_type &&
            available_fields.includes(field.field_key) &&
            field.html_type === 'checkbox'
          );
        });
        return fields;
      }
      return [];
    },
  },
};
</script>

<style scoped>
.intake-view {
  height: 600px;
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.intake-view::-webkit-scrollbar {
  /* WebKit */
  width: 0;
  height: 0;
}

.notes {
  background-color: rgba(216, 216, 216, 0.15);
}

.notes-time {
  color: #848f99;
}

.work_type_section {
  @apply border-b py-4;
  display: grid;
  grid-template-columns: 1fr 2fr 0.5fr;
  justify-items: start;
  align-items: center;
}
</style>
