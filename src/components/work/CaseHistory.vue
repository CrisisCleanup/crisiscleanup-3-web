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
          worksite.work_types.some((work_type) => Boolean(work_type.claimed_by))
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
        :key="user"
        :user="user"
        v-for="(timeline, user) in timelineUsers"
        :events="timeline"
      />
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <spinner />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import Timeline from '../Timeline.vue';
import EventTimeline from '../EventTimeline.vue';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { groupBy } from '@/utils/array';
import Worksite from '@/models/Worksite';

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
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const worksite = ref<Worksite>(new Worksite());
    const worksiteHistory = ref([]);
    const ready = ref(false);

    const currentUser = computed(() => {
      return User.find(props.worksiteId || route.params.id);
    });

    const users = computed(() => {
      return groupBy(worksite?.value?.events, 'created_by');
    });

    const timelineUsers = computed(() => {
      return groupBy(worksiteHistory.value, 'created_by');
    });

    const organizationsWithClaims = computed(() => {
      const claimedIds = worksite?.value?.work_types
        .filter((workType) => Boolean(workType.claimed_by))
        .map((workType) => workType.claimed_by);
      const idSet = new Set(claimedIds);
      return [...idSet];
    });

    onMounted(async () => {
      ready.value = false;
      try {
        await Worksite.api().fetch(
          props.worksiteId || route.params.id,
          props.incidentId || route.params.incident_id,
        );

        const result = await Worksite.api().getHistory(props.worksiteId);
        worksiteHistory.value = result.response.data;
      } catch {
        await router.push(
          `/incident/${props.incidentId || route.params.incident_id}/cases/new`,
        );
      } finally {
        ready.value = true;
      }
      worksite.value = Worksite.find(props.worksiteId || route.params.id);
      if (route.query.showOnMap) {
        emit('jumpToCase', props.worksiteId || route.params.id);
      }
    });

    const getOrganizationName = (id: string) => {
      const organization = Organization.find(id);
      return organization?.name;
    };

    return {
      worksite,
      worksiteHistory,
      ready,
      currentUser,
      users,
      organizationsWithClaims,
      getOrganizationName,
      timelineUsers,
    };
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
