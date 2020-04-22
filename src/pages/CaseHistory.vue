<template>
  <div v-if="ready" class="bg-white flex flex-col flex-grow">
    <div class="p-3 flex-grow intake-view">
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
        <div v-for="org in organizationsWithClaims" :key="org.id" class="my-1">
          {{ getOrganizationName(org) }}
        </div>
      </div>
      <div class="">
        <div
          v-for="(events, user) in users"
          :key="user.id"
          class="py-5 border-b"
        >
          <v-popover popover-class="user-popover" placement="top-start">
            <span class="text-yellow-600 tooltip-target cursor-pointer">{{
              getUser(user).full_name
            }}</span>
            made {{ events.length }} edits
            <div slot="popover">
              <div class="text-base">{{ getUser(user).full_name }}</div>
              <div class="text-xs">{{ getUser(user).organization.name }}</div>
              <div class="mt-2">
                <font-awesome-icon icon="envelope" />
                <a :href="`mailto:${getUser(user).email}`" class="ml-1">{{
                  getUser(user).email
                }}</a>
              </div>
              <div v-if="getUser(user).mobile">
                <font-awesome-icon icon="phone" />
                <a :href="`tel:${getUser(user).email}`" class="ml-1">{{
                  getUser(user).mobile
                }}</a>
              </div>
            </div>
          </v-popover>
          <div v-for="event in events" :key="event.id">
            {{ event.created_at | moment('MM/DD/YYYY, h:mm:ss A') }}:
            {{ event.event.event_name_t }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <spinner />
  </div>
</template>

<script>
import User from '@/models/User';
import Organization from '@/models/Organization';
import { groupBy } from '@/utils/array';
import Worksite from '@/models/Worksite';

export default {
  name: 'CaseHistory',
  data() {
    return {
      worksite: {},
      ready: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    users() {
      return groupBy(this.worksite.events, 'user');
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
        this.$route.params.id,
        this.$route.params.incident_id,
      );
    } catch (e) {
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/new`,
      );
    } finally {
      this.ready = true;
    }
    this.worksite = Worksite.find(this.$route.params.id);
    if (this.$route.query.showOnMap) {
      this.$emit('jumpToCase', this.$route.params.id);
    }
  },
  methods: {
    getOrganizationName(id) {
      const organization = Organization.find(id);
      return organization.name;
    },
    getUser(id) {
      return User.find(id);
    },
  },
};
</script>

<style>
.user-popover {
  @apply bg-black text-white p-3 outline-none;
  width: 230px;
  left: 0.75rem !important;
  z-index: 100;
}
</style>

<style scoped>
.intake-view {
  height: 600px;
  overflow: scroll;
}
</style>
