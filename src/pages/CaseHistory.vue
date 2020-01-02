<template>
  <div class="bg-white flex flex-col flex-grow">
    <div class="p-3 flex-grow intake-view">
      <div class="my-4 pb-6 border-b">
        <span>
          <strong>{{
            $t(
              'WARNING: DO NOT SHARE THIS INFORMATION WITH SURVIVORS (This hasalready been a problem).',
            )
          }}</strong
          >{{
            $t(
              'This information is for internal coordination use only. If you are nota member of a volunteers organization, you may not tell them what todo, or when to deploy. If you don‘t follow these instructions, we willhave to take away your nice things and use paper plates instead of china.',
            )
          }}
        </span>
      </div>
      <div
        v-if="
          worksite.work_types.filter(work_type => Boolean(work_type.claimed_by))
            .length > 0
        "
        class="my-4"
      >
        <label class="my-1 text-xs font-bold text-gray-600 block">{{
          $t('searchFilterAside.claimed_by')
        }}</label>
        <div v-for="org in organizationsWithClaims" class="my-1">
          {{ getOrganizationName(org) }}
        </div>
      </div>
      <div class="">
        <div v-for="(events, user) in users" class="py-5 border-b">
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
          <div v-for="event in events">
            {{ event.created_at | moment('MM/DD/YYYY, h:mm:ss A') }}:
            {{ event.event.event_name_t }}
          </div>
        </div>
      </div>
    </div>
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
      const claimed_ids = this.worksite.work_types
        .filter(work_type => Boolean(work_type.claimed_by))
        .map(work_type => work_type.claimed_by);
      const id_set = new Set(claimed_ids);
      return Array.from(id_set);
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
        `/incident/${this.$route.params.incident_id}/cases/new`,
      );
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
      const user = User.find(id);
      return user;
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
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.intake-view::-webkit-scrollbar {
  /* WebKit */
  width: 0;
  height: 0;
}
</style>
