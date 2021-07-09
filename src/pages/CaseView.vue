<template>
  <div
    v-if="worksite"
    class="bg-white flex flex-col intake-view-container"
    :style="cssVars"
  >
    <div class="flex p-1">
      <flag
        v-for="flag in worksite.flags"
        :key="flag.reason_t"
        :flag-reason="flag.reason_t"
      />
    </div>
    <div class="flex-grow intake-view">
      <SectionHeading :count="1" class="mb-3">{{
        $t('caseForm.property_information')
      }}</SectionHeading>
      <section class="px-3 pb-3">
        <WorksiteNotes @saveNote="saveNote" :worksite="worksite" />

        <div class="flex flex-row">
          <div class="flex-1">
            <label
              class="my-1 text-xs font-bold text-crisiscleanup-grey-700 block"
              >{{ $t('formLabels.name') }}</label
            >
            <div>{{ worksite.name }}</div>
          </div>
          <div class="flex-1">
            <div class="flex flex-row">
              <div class="flex-1">
                <label
                  class="
                    my-1
                    text-xs
                    font-bold
                    text-crisiscleanup-grey-700
                    block
                  "
                  >{{ $t('formLabels.phone1') }}</label
                >
                <div>{{ worksite.phone1 }}</div>
              </div>
              <div v-if="$can && $can('phone_agent')" class="flex-1">
                <base-button
                  ccu-icon="phone-classic"
                  icon-size="md"
                  size="xxs"
                  variant="outline"
                  class="worksite__dialer"
                  v-tooltip="{ content: 'Call Number' }"
                  :action="() => openDialerTab(worksite.phone1)"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            class="my-1 text-xs font-bold text-crisiscleanup-grey-700 block"
            >{{ $t('formLabels.address') }}</label
          >
          <div>{{ worksiteAddress }}</div>
        </div>
      </section>
      <SectionHeading :count="3" class="mb-3"
        >{{ $t('caseForm.work') }}
        <template #action>
          <base-button
            v-if="workTypesUnclaimed.length > 0"
            class="ml-2 p-1 px-3 text-xs"
            variant="solid"
            :text="$t('actions.claim_all_alt')"
            :action="
              () => {
                return claimWorkType(
                  workTypesUnclaimed.map((workType) => workType.work_type),
                );
              }
            "
          />
          <template v-if="workTypesClaimedByOthersUnrequested.length > 0">
            <base-button
              v-if="incident.turn_on_release && workTypesReleaseable.length > 0"
              class="ml-2 p-1 px-3 text-xs"
              variant="solid"
              :text="$t('actions.release_all')"
              :action="
                () => {
                  return releaseWorkType(
                    workTypesReleaseable.map((workType) => workType.work_type),
                  );
                }
              "
            />
            <base-button
              v-else
              class="ml-2 p-1 px-3 border-black border-2 border-black text-xs"
              :text="$t('actions.request_all')"
              :action="
                () => {
                  requestingWorkTypes = true;
                  initialWorkTypeRequestSelection = [];
                }
              "
            />
          </template>
        </template>
      </SectionHeading>
      <section class="px-3 pb-3">
        <div v-if="Object.keys(workTypesClaimedByOthers).length > 0">
          <label
            class="my-1 text-xs font-bold text-crisiscleanup-grey-700 block"
            >{{ $t('caseView.claimed_by') }}</label
          >
          <div
            v-for="organization in Object.keys(workTypesClaimedByOthers)"
            :key="`${organization.id}`"
            class="my-1"
          >
            {{ getOrganizationName(organization) }}
          </div>
        </div>
        <div>
          <div v-if="Object.keys(workTypesClaimedByOthers).length > 0">
            <div
              v-for="(work_types, organization) in workTypesClaimedByOthers"
              :key="organization.id"
            >
              <label class="text-xs font-bold text-crisiscleanup-grey-700"
                >{{ $t('caseView.claimed_by') }}
                {{ getOrganizationName(organization) }}</label
              >
              <template v-for="work_type in work_types">
                <div :key="work_type.id" class="work_type_section">
                  <span class="text-sm">{{
                    work_type.work_type | getWorkTypeName
                  }}</span>
                  <WorksiteStatusDropdown
                    class="block"
                    :phase="incident.phase"
                    :current-work-type="work_type"
                    @input="
                      (value) => {
                        statusValueChange(value, work_type);
                      }
                    "
                  />

                  <base-button
                    v-if="incident.turn_on_release && isStaleCase(work_type)"
                    class="ml-2 p-1 px-3 text-xs"
                    variant="solid"
                    :text="$t('actions.release')"
                    :action="
                      () => {
                        return releaseWorkType([work_type.work_type]);
                      }
                    "
                  />

                  <template v-else>
                    <base-button
                      v-if="!worksiteRequestWorkTypeIds.has(work_type.id)"
                      type="link"
                      :action="
                        () => {
                          requestingWorkTypes = true;
                          initialWorkTypeRequestSelection = [
                            work_type.work_type,
                          ];
                        }
                      "
                      :text="$t('actions.request')"
                      class="ml-2 p-1 px-3 text-xs"
                    />
                    <div v-else class="ml-2 p-1 px-3 text-xs">
                      {{ $t('caseView.requested') }}
                    </div>
                  </template>
                  <div class="work-list">
                    {{
                      getFieldsForType(work_type.work_type)
                        .map((_) => _.label_t)
                        .join(', ')
                    }}
                  </div>
                  <div class="recurrence" v-if="work_type.recur">
                    {{ work_type.recur | getRecurrenceString }}
                    <br />
                    {{ $t('caseView.next') }}
                    {{
                      work_type.next_recur_at
                        | moment('ddd MMMM Do YYYY [at] h:mm:ss A')
                    }}
                  </div>
                </div>
              </template>
              <WorkTypeRequestModal
                v-if="requestingWorkTypes"
                :work-types="workTypesClaimedByOthersUnrequested"
                :initial-selection="initialWorkTypeRequestSelection"
                :my-organization="currentUser.organization"
                @onRequest="requestWorkTypes"
                @onCancel="requestingWorkTypes = false"
              />
            </div>
          </div>
          <div v-if="workTypesClaimedByOrganization.length > 0">
            <label class="text-xs font-bold text-crisiscleanup-grey-700">{{
              $t('caseView.claimed_by_my_org')
            }}</label>
            <template v-for="work_type in workTypesClaimedByOrganization">
              <div :key="work_type.id" class="work_type_section">
                <span class="text-sm">{{
                  work_type.work_type | getWorkTypeName
                }}</span>
                <WorksiteStatusDropdown
                  class="block"
                  :phase="incident.phase"
                  :current-work-type="work_type"
                  @input="
                    (value) => {
                      statusValueChange(value, work_type);
                    }
                  "
                />
                <base-button
                  variant="solid"
                  :action="
                    () => {
                      return unclaimWorkType([work_type.work_type]);
                    }
                  "
                  :text="$t('actions.unclaim')"
                  class="ml-2 p-1 px-3 text-xs"
                />
                <div class="work-list">
                  {{
                    getFieldsForType(work_type.work_type)
                      .map((_) => _.label_t)
                      .join(', ')
                  }}
                </div>
                <div class="recurrence" v-if="work_type.recur">
                  {{ work_type.recur | getRecurrenceString }}
                  <br />
                  {{ $t('caseView.next') }}
                  {{
                    work_type.next_recur_at
                      | moment('ddd MMMM Do YYYY [at] h:mm:ss A')
                  }}
                </div>
              </div>
            </template>
          </div>
          <div v-if="workTypesUnclaimed.length > 0" class="mt-3">
            <label class="text-xs font-bold text-crisiscleanup-grey-700">{{
              $t('caseView.unclaimed_work_types')
            }}</label>
            <template v-for="work_type in workTypesUnclaimed">
              <div :key="work_type.id" class="work_type_section">
                <span class="text-sm">{{
                  work_type.work_type | getWorkTypeName
                }}</span>
                <WorksiteStatusDropdown
                  class="block"
                  :phase="incident.phase"
                  :current-work-type="work_type"
                  @input="
                    (value) => {
                      statusValueChange(value, work_type);
                    }
                  "
                />
                <base-button
                  variant="solid"
                  :action="
                    () => {
                      return claimWorkType([work_type.work_type]);
                    }
                  "
                  :text="$t('actions.claim')"
                  class="ml-2 p-1 px-3 text-xs"
                />
                <div class="work-list">
                  {{
                    getFieldsForType(work_type.work_type)
                      .map((_) => _.label_t)
                      .join(', ')
                  }}
                </div>
                <div class="recurrence" v-if="work_type.recur">
                  {{ work_type.recur | getRecurrenceString }}
                  <br />
                  {{ $t('caseView.next') }}
                  {{
                    work_type.next_recur_at
                      | moment('ddd MMMM Do YYYY [at] h:mm A')
                  }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
      <SectionHeading :count="5" class="mb-3">{{
        $t('caseView.report')
      }}</SectionHeading>
      <WorksiteReportSection :worksite="worksite" :key="worksite.total_time" />
      <SectionHeading :count="6" class="mb-3">{{
        $t('caseForm.photos')
      }}</SectionHeading>
      <WorksiteImageSection :worksite="worksite" :key="worksite.files" />
    </div>
    <div
      class="
        bg-white
        p-3
        border border-r-0 border-gray-300
        card-footer
        flex
        justify-center
        items-center
      "
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
        variant="solid"
        class="m-1 text-black p-3 px-4"
        :text="$t('actions.claim')"
        :action="
          () => {
            showingClaimModal = true;
          }
        "
      />
      <base-button
        v-if="workTypesClaimedByOthersUnrequested.length > 0"
        size="medium"
        class="m-1 text-black p-3 px-4 border-2 border-black"
        :text="$t('actions.request')"
        :action="
          () => {
            requestingWorkTypes = true;
            initialWorkTypeRequestSelection = [];
          }
        "
      />
      <base-button
        size="medium"
        variant="solid"
        class="m-1 text-black p-3 px-4"
        data-cy="caseview-actions-done"
        :text="$t('actions.done')"
        :action="
          () => {
            $emit('closeWorksite');
          }
        "
      />
    </div>

    <modal v-if="showingClaimModal" modal-classes="bg-white max-w-lg shadow">
      <div slot="header" class="text-lg border-b p-3">
        {{ $t('actions.claim_cases') }}
      </div>
      <div class="p-3">
        <base-checkbox
          v-for="work_type_to_claim in workTypesUnclaimed"
          class="mb-3"
          :value="workTypesToClaim.has(work_type_to_claim.work_type)"
          :key="work_type_to_claim.work_type"
          @input="
            (value) => {
              updateWorkTypesToClaim(value, work_type_to_claim);
            }
          "
        >
          <span class="text-sm">{{
            work_type_to_claim.work_type | getWorkTypeName
          }}</span>
          <div class="work-list">
            {{
              getFieldsForType(work_type_to_claim.work_type)
                .map((_) => _.label_t)
                .join(', ')
            }}
          </div>
        </base-checkbox>
      </div>
      <div
        slot="footer"
        class="flex items-center justify-center p-2 bg-white border-t"
      >
        <base-button
          variant="solid"
          class="border text-base p-2 px-4 mx-2 text-black border-primary-light"
          :action="
            () => {
              claimWorkType(Array.from(workTypesToClaim));
            }
          "
          :text="$t('actions.ok')"
          :alt="$t('actions.ok')"
        />
        <base-button
          type="bare"
          class="border border-black mx-2 text-base p-2 px-4 text-black"
          :action="
            () => {
              showingClaimModal = false;
            }
          "
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
        />
      </div>
    </modal>
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <spinner />
  </div>
</template>

<script>
import { getErrorMessage } from '@/utils/errors';
import WorksiteStatusDropdown from '@/components/WorksiteStatusDropdown';
import User from '@/models/User';
import Worksite from '@/models/Worksite';
import Incident from '@/models/Incident';
import WorksiteRequest from '@/models/WorksiteRequest';
import { groupBy } from '@/utils/array';
import Organization from '@/models/Organization';
import WorkTypeRequestModal from '@/components/WorkTypeRequestModal';
import { getQueryString } from '@/utils/urls';
import { LocaleMixin } from '@/mixins/locale';
import SectionHeading from '@/components/SectionHeading';
import WorksiteImageSection from '@/components/WorksiteImageSection';
import WorksiteReportSection from '@/components/WorksiteReportSection';
import { DialogsMixin } from '@/mixins';
import Flag from './Flag';
import WorksiteNotes from './WorksiteNotes';

export default {
  name: 'CaseView',
  components: {
    WorksiteNotes,
    WorksiteReportSection,
    WorksiteImageSection,
    Flag,
    SectionHeading,
    WorkTypeRequestModal,
    WorksiteStatusDropdown,
  },
  mixins: [LocaleMixin, DialogsMixin],
  data() {
    return {
      addingNotes: false,
      addingTime: false,
      expandedNotes: {},
      showingAllNotes: false,
      requestingWorkTypes: false,
      initialWorkTypeRequestSelection: [],
      currentNote: '',
      uploading: false,
      showingClaimModal: false,
      workTypesToClaim: new Set(),
    };
  },
  computed: {
    cssVars() {
      const formHeight = `${this.worksite.flags.length ? '325' : '300'}px`;
      return {
        'grid-template-rows': `auto calc(100vh - ${formHeight} - var(--safe-area-inset-bottom)) 80px`,
      };
    },
    worksite() {
      return Worksite.find(this.$route.params.id);
    },
    incident() {
      return Incident.find(this.$route.params.incident_id);
    },
    workTypesClaimedByOrganization() {
      if (this.worksite) {
        return this.worksite.work_types.filter(
          (type) => type.claimed_by === this.currentUser.organization.id,
        );
      }
      return [];
    },
    workTypesClaimedByOthers() {
      if (this.worksite) {
        const list = this.worksite.work_types.filter(
          (type) =>
            type.claimed_by &&
            type.claimed_by !== this.currentUser.organization.id,
        );
        return groupBy(list, 'claimed_by');
      }
      return [];
    },
    workTypesClaimedByOthersUnrequested() {
      return this.worksite.work_types.filter(
        (type) =>
          type.claimed_by &&
          type.claimed_by !== this.currentUser.organization.id &&
          !this.worksiteRequestWorkTypeIds.has(type.id),
      );
    },
    workTypesReleaseable() {
      return this.workTypesClaimedByOthersUnrequested.filter((type) =>
        this.isStaleCase(type),
      );
    },
    workTypesUnclaimed() {
      if (this.worksite) {
        return this.worksite.work_types.filter(
          (type) => type.claimed_by === null,
        );
      }
      return [];
    },
    worksiteAddress() {
      if (this.worksite) {
        // eslint-disable-next-line camelcase
        const { address, city, state, postal_code: postalCode } = this.worksite;
        return `${address}, ${city}, ${state} ${postalCode}`;
      }
      return '';
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    worksiteRequests() {
      return WorksiteRequest.query()
        .where('worksite', parseInt(this.$route.params.id))
        .get();
    },
    worksiteRequestWorkTypeIds() {
      return new Set(
        this.worksiteRequests.map((request) => request.worksite_work_type.id),
      );
    },
  },
  async mounted() {
    try {
      await Worksite.api().fetch(
        this.$route.params.id,
        this.$route.params.incident_id,
      );

      await this.getWorksiteRequests();

      if (
        Number(this.worksite.incident) !==
        Number(this.$route.params.incident_id)
      ) {
        await this.$router.push(
          `/incident/${this.$route.params.incident_id}/cases/new`,
        );
      }
    } catch (e) {
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/new`,
      );
    }
    if (this.$route.query.showOnMap) {
      this.$emit('jumpToCase', this.$route.params.id);
    }
  },
  methods: {
    updateWorkTypesToClaim(value, workTypeToClaim) {
      if (value) {
        this.workTypesToClaim.add(workTypeToClaim.work_type);
      } else {
        this.workTypesToClaim.delete(workTypeToClaim.work_type);
      }
      this.workTypesToClaim = new Set(this.workTypesToClaim);
    },
    isStaleCase(workType) {
      return this.$moment(workType.created_at).isBefore(
        this.$moment().add(-30, 'days'),
      );
    },
    async getWorksiteRequests() {
      const worksiteRequestParams = {
        worksite_work_type__worksite: this.$route.params.id,
      };

      await WorksiteRequest.api().get(
        `/worksite_requests?${getQueryString(worksiteRequestParams)}`,
        {
          dataKey: 'results',
        },
      );
    },
    async claimWorkType(workTypes = []) {
      try {
        await Worksite.api().claimWorksite(this.worksite.id, workTypes);
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
        this.showingClaimModal = false;
        this.workTypesToClaim = new Set();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async releaseWorkType(workTypes = []) {
      try {
        const result = await this.$prompt({
          title: this.$t('actions.release_cases'),
          content: this.$t('caseView.please_justify_release'),
        });
        if (!result) {
          return;
        }

        await Worksite.api().releaseWorkType(
          this.worksite.id,
          workTypes,
          result,
        );
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async unclaimWorkType(workTypes = []) {
      try {
        await Worksite.api().unclaimWorksite(this.worksite.id, workTypes);
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async requestWorkTypes({ workTypes, reason }) {
      try {
        this.requestingWorkTypes = false;
        await Worksite.api().requestWorksite(
          this.worksite.id,
          workTypes,
          reason,
        );
        await Worksite.api().fetch(this.worksite.id);
        await this.getWorksiteRequests();
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
        await this.$toasted.success(
          this.$t('Successfully requested work types'),
        );
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async saveNote(currentNote) {
      try {
        await Worksite.api().addNote(this.worksite.id, currentNote);
        await Worksite.api().fetch(this.worksite.id);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
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
    async statusValueChange(value, workType) {
      try {
        await Worksite.api().updateWorkTypeStatus(workType.id, value);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('reloadMap', this.worksite.id);
        this.$emit('reloadTable');
      }
    },

    getFieldsForType(workType) {
      if (this.incident) {
        const availableFields = this.worksite.form_data.map(
          (data) => data.field_key,
        );
        return this.incident.form_fields.filter((field) => {
          const parent = this.incident.form_fields.find((element) => {
            return element.field_key === field.field_parent_key;
          });

          // eslint-disable-next-line camelcase
          let { if_selected_then_work_type } = field;
          if (parent) {
            if_selected_then_work_type = parent.if_selected_then_work_type;
          }

          return (
            if_selected_then_work_type === workType &&
            availableFields.includes(field.field_key) &&
            field.html_type === 'checkbox'
          );
        });
      }
      return [];
    },
    openDialerTab(phoneNumber) {
      return window.open(
        this.$router.resolve({
          name: 'nav.phone',
          query: { dialNumber: phoneNumber },
        }).href,
        '_blank',
      );
    },
  },
};
</script>

<style scoped>
.intake-view {
  overflow: auto;
}

.work_type_section {
  @apply border-b py-4;
  display: grid;
  grid-template-columns: 1fr 2fr 0.5fr;
  justify-items: start;
  align-items: center;
}
.work-list {
  @apply mt-1 text-crisiscleanup-grey-900;
  grid-column-start: 1;
  grid-column-end: 4;
}

.recurrence {
  @apply mt-1 text-crisiscleanup-grey-900 flex flex-col;
  grid-column-start: 1;
  grid-column-end: 4;
}

.max-lines {
  display: block; /* or inline-block */
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow: hidden;
  max-height: 5em;
}

button.worksite__dialer {
  @apply rounded-full;
}

button.worksite__dialer >>> img.ccu-icon {
  transition: filter 300ms ease;
}

button.worksite__dialer:hover >>> img.ccu-icon {
  filter: brightness(0) invert(1);
}

.intake-view-container {
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  display: grid;
}
</style>
