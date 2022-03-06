<template>
  <TitledCard
    :title="$t('~~Leaderboard')"
    :dropdown="dropdownProps"
    @update:dropdown="onDropdownUpdate"
  >
    <div class="h-64 overflow-y-scroll">
      <div
        class="flex items-center justify-between p-2"
        v-for="rank in leaderboard"
        :key="rank.user"
      >
        <div class="flex">
          <div class="image">
            <Avatar
              :initials="rank.user.full_name"
              :url="rank.user && rank.user.profilePictureUrl"
              size="xsmall"
              inner-classes="shadow"
            />
          </div>
          <div class="info pl-2">
            <div class="flex items-center justify-start">
              <UserDetailsTooltip
                :dark="false"
                :name-class="'text-h3 font-h3 text-crisiscleanup-dark-500 name-tooltip'"
                :user="rank.user.id"
                :name-style="nameTextStyle"
              />
              <div class="flex">
                <div
                  class="flex flex-col pl-1"
                  v-for="l in getLanguageTags('en-US')"
                  :key="l"
                >
                  <LanguageTag class="text-bodyxsm" :language-subtag="l" />
                </div>
              </div>
            </div>
            <div class="info--org" v-if="rank.user.organization">
              <base-text :style="{ lineHeight: '16px' }" variant="h4" regular>
                {{ rank.user.organization.name | truncate(28) }}
              </base-text>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-x-4">
          <template v-if="true">
            <div>{{ $t('~~Inbound') }}</div>
            <div>{{ $t('~~Outbound') }}</div>
            <div>{{ $t('~~Total') }}</div>
          </template>
          <div
            class="metric"
            v-for="m in ['inbound_calls', 'outbound_calls', 'total']"
            :key="m"
          >
            <base-text variant="h1" semi-bold>
              {{ rank[m] | padStart(2, '0') }}
            </base-text>
          </div>
        </div>
      </div>
    </div>
  </TitledCard>
</template>

<script>
import User from '@/models/User';
import Avatar from '@/components/Avatar';
import UserDetailsTooltip from '@/components/user/DetailsTooltip';
import LanguageTag from '@/components/tags/LanguageTag';
import TitledCard from '@/components/cards/TitledCard';

const LEADERBOARD_RESOLUTIONS = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
  ALL_TIME: 'all_time',
});

export default {
  name: 'Leaderboard',
  components: { TitledCard, LanguageTag, UserDetailsTooltip, Avatar },
  data() {
    return {
      leaderboard: [],
      resolution: LEADERBOARD_RESOLUTIONS.DAILY,
      nameTextStyle: {
        lineHeight: '1rem',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    };
  },
  async mounted() {
    await this.loadLeaderboard(this.resolution);
  },
  methods: {
    async loadLeaderboard(resolution) {
      this.resolution = resolution;
      const { data } = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/phone/leaderboard?resolution=${resolution}`,
      );

      await this.getUsers(data.map((ranking) => ranking.user));
      this.leaderboard = data;
      this.leaderboard.forEach((ranking) => {
        ranking.user = this.getUser(ranking.user);
        ranking.total = ranking.inbound_calls + ranking.outbound_calls;
      });
      this.leaderboard.sort((a, b) => b.total - a.total);
    },
    async getUsers(userIds) {
      await User.api().get(`/users?id__in=${userIds.join(',')}`, {
        dataKey: 'results',
      });
    },
    getLanguageTags(locale) {
      return locale.split('#');
    },
    getUser(id) {
      return User.find(id);
    },
    async onDropdownUpdate(value) {
      await this.loadLeaderboard(value);
    },
  },
  computed: {
    dropdownProps() {
      return {
        label: 'name',
        itemKey: 'key',
        value: this.resolution,
        options: [
          {
            key: LEADERBOARD_RESOLUTIONS.DAILY,
            name: this.$t('phoneDashboard.today'),
          },
          {
            key: LEADERBOARD_RESOLUTIONS.WEEKLY,
            name: this.$t('phoneDashboard.this_week'),
          },
          {
            key: LEADERBOARD_RESOLUTIONS.ALL_TIME,
            name: this.$t('phoneDashboard.all_time'),
          },
        ],
      };
    },
  },
};
</script>
