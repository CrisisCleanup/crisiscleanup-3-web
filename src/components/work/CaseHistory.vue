<template>
  <div v-if="ready" class="bg-white grid intake-view overflow-auto">
    <div class="p-3">
      <div class="my-4 pb-6 border-b">
        <span>
          <strong>{{ $t('caseHistory.do_not_share_contact_warning') }}</strong
          >{{ $t('caseHistory.do_not_share_contact_explanation') }}
        </span>
      </div>
      <div
        v-if="
          worksite.work_types.filter((work_type) =>
            Boolean(work_type.claimed_by),
          ).length > 0
        "
        class="my-4"
      >
        <label
          class="my-1 text-xs font-bold text-crisiscleanup-grey-700 block"
          >{{ $t('caseHistory.claimed_by') }}</label
        >
        <div
          v-for="org in organizationsWithClaims"
          :key="`${org.id}`"
          class="my-1"
        >
          {{ getOrganizationName(org) }}
        </div>
      </div>
      <EventTimeline
        v-if="worksiteHistory.length > 0"
        :events="worksiteHistory"
      />
      <Timeline v-else :events="worksite.events" />
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <spinner />
  </div>
</template>

<script lang="ts">
import User from '../../models/User';
import Organization from '../../models/Organization';
import { groupBy } from '../../utils/array';
import Worksite from '../../models/Worksite';
import Timeline from '../../components/Timeline.vue';
import EventTimeline from '../../components/EventTimeline.vue';

export default defineComponent({
  name: 'CaseHistory',
  components: { EventTimeline, Timeline },
  props: {
    worksiteId: {
      type: Number,
      default: null,
    },
    incidentId: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      worksite: {},
      worksiteHistory: [],
      ready: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    users() {
      return groupBy(this.worksite.events, 'created_by');
    },
    organizationsWithClaims() {
      const claimedIds = this.worksite.work_types
        .filter((workType) => Boolean(workType.claimed_by))
        .map((workType) => workType.claimed_by);
      const idSet = new Set(claimedIds);
      return Array.from(idSet);
    },
  },
  async mounted() {
    this.ready = false;
    try {
      await Worksite.api().fetch(
        this.worksiteId || this.$route.params.id,
        this.incidentId || this.$route.params.incident_id,
      );

      const result = await Worksite.api().getHistory(this.worksiteId);
      this.worksiteHistory = result.response.data;
    } catch (e) {
      await this.$router.push(
        `/incident/${
          this.incidentId || this.$route.params.incident_id
        }/cases/new`,
      );
    } finally {
      this.ready = true;
    }
    this.worksite = Worksite.find(this.worksiteId || this.$route.params.id);
    if (this.$route.query.showOnMap) {
      this.$emit('jumpToCase', this.worksiteId || this.$route.params.id);
    }
  },
  methods: {
    getOrganizationName(id) {
      const organization = Organization.find(id);
      return organization.name;
    },
  },
});
</script>

<style scoped>
.intake-view {
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  grid-template-columns: 1fr;
  grid-template-rows: calc(100vh - 240px - var(--safe-area-inset-bottom));
}
</style>
