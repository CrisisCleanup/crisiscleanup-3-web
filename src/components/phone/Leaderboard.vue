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
            <div
              :style="{ lineHeight: '16px' }"
              :class="`${rank.state[1]}`"
            >
              &#8226; {{ rank.state[0] }}
            </div>
            <base-text
              :style="{ lineHeight: '16px' }"
              class="pl-2 text-crisiscleanup-dark-300 opacity-50"
              variant="h4"
              regular
            >
              {{ rank.state_at | moment('from', 'now') }}
            </base-text>
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

const AGENT_STATES = Object.freeze({
  AWAY: ['away', 'text-red-500'],
  AVAILABLE: ['online', 'text-green-300'],
  OFFLINE: ['offline', 'text-dark-blue'],
  TRANSITION: ['connecting', 'text-yellow-500'],
  ENGAGED: ['talking', 'text-crisiscleanup-teal'],
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
      socket: null,
      agentStats: null,
    };
  },
  async created() {
    const endpoint = process.env.VUE_APP_API_BASE_URL.replace('http', 'ws');
    const url = `${endpoint}/ws/phone_stats`;
    this.socket = new WebSocket(url);

    this.socket.onmessage = (e) => {
      this.agentStats = JSON.parse(e.data);
    };
    this.socket.onopen = (e) => {
      this.$log.debug('open connection with phone stats socket', e);
    };
    this.socket.onerror = (e) => {
      this.$log.error(e);
    };
    this.socket.onclose = (e) => {
      console.log('closed connection with phone stats socket', e);
    };
  },
  async mounted() {
    await this.loadLeaderboard(this.resolution);
  },
  unmounted() {
    this.socket.close();
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
      });
      this.buildLeaderboard();
    },
    async getUsers(userIds) {
      await User.api().get(`/users?id__in=${userIds.join(',')}`, {
        dataKey: 'results',
      });
    },
    buildLeaderboard() {
      this.leaderboard.forEach((ranking) => {
        if (this.agentStats) {
          const agentState = this.agentStats.find(
            (u) => String(u.user) === String(ranking.user.id),
          );
          ranking.state =
            AGENT_STATES[agentState ? agentState.state : 'OFFLINE'];
          ranking.state_at = agentState.state_at;
        }
        ranking.total = ranking.inbound_calls + ranking.outbound_calls;
      });
      this.leaderboard.sort((a, b) => b.total - a.total);
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
  watch: {
    agentStats() {
      this.buildLeaderboard();
    },
  },
};
</script>
