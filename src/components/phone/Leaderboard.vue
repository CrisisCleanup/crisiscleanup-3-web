<template>
  <TitledCard
    :title="$t('phoneDashboard.leaderboard')"
    :dropdown="dropdownProps"
    data-testid="testLeaderboardDiv"
    @update:dropdown="onDropdownUpdate"
  >
    <div class="h-full overflow-y-scroll">
      <div
        v-for="rank in leaderboard"
        :key="rank.user"
        class="flex items-center justify-between p-2"
      >
        <div class="flex">
          <div class="image">
            <Avatar
              :initials="rank.user.full_name"
              :url="rank.user && rank.user.profilePictureUrl"
              data-testid="testAvatarIcon"
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
                data-testid="testUserInfoTooltip"
              />
              <div class="flex">
                <div
                  v-for="l in getLanguageTags('en-US')"
                  :key="l"
                  class="flex flex-col pl-1"
                >
                  <LanguageTag class="text-bodyxsm" :language-subtag="l" />
                </div>
              </div>
            </div>
            <div v-if="rank.user.organization" class="info--org">
              <base-text :style="{ lineHeight: '16px' }" variant="h4" regular>
                {{ truncate(rank.user.organization.name, 28) }}
              </base-text>
            </div>
            <div
              v-if="rank.state"
              :style="{ lineHeight: '16px' }"
              :class="`${rank.state[1]}`"
            >
              &#8226; {{ rank.state[0] }}
            </div>
            <base-text
              v-if="rank.state_at"
              :style="{ lineHeight: '16px' }"
              class="pl-2 text-crisiscleanup-dark-300 opacity-50"
              variant="h4"
              regular
            >
              {{ momentFromNow(rank.state_at) }}
            </base-text>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-x-4">
          <template v-if="true">
            <div data-testid="testInboundCountDiv">{{ $t('phoneDashboard.inbound') }}</div>
            <div data-testid="testOutboundCountDiv">{{ $t('phoneDashboard.outbound') }}</div>
            <div data-testid="testTotalCountdiv">{{ $t('phoneDashboard.total') }}</div>
          </template>
          <div
            v-for="m in ['inbound_calls', 'outbound_calls', 'total']"
            :key="m"
            class="metric"
          >
            <base-text variant="h1" semi-bold>
              {{ padStart(rank[m], 2, '0') }}
            </base-text>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="previous || next"
      class="flex items-center justify-between p-2 border-t"
    >
      <base-button
        :disabled="!previous"
        data-testid="testPreviousButton"
        class="bg-crisiscleanup-light-smoke w-6 h-6"
        variant="solid"
        icon-size="xs"
        ccu-icon="arrow-left"
        :alt="$t('actions.previous')"
        :action="() => loadLeaderboard(null, previous)"
      />
      <base-button
        ccu-icon="arrow-right"
        data-testid="testNextButton"
        icon-size="xs"
        class="bg-crisiscleanup-light-smoke w-6 h-6"
        variant="solid"
        :alt="$t('actions.next')"
        :disabled="!next"
        :action="() => loadLeaderboard(null, next)"
      />
    </div>
  </TitledCard>
</template>

<script lang="ts">
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { padStart, truncate } from 'lodash';
import User from '../../models/User';
import Avatar from '../Avatar.vue';
import UserDetailsTooltip from '../user/DetailsTooltip.vue';
import LanguageTag from '../tags/LanguageTag.vue';
import TitledCard from '../cards/TitledCard.vue';
import { useWebSockets } from '../../hooks/useWebSockets';
import useEmitter from '../../hooks/useEmitter';
import { momentFromNow } from '../../filters/index';

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

export default defineComponent({
  name: 'Leaderboard',
  components: { TitledCard, LanguageTag, UserDetailsTooltip, Avatar },
  setup() {
    const { emitter } = useEmitter();
    const { t } = useI18n();
    const leaderboard = ref([]);
    const previous = ref(null);
    const next = ref(null);
    const resolution = ref(LEADERBOARD_RESOLUTIONS.DAILY);
    const socket = ref(null);
    const agentStats = ref(null);
    const nameTextStyle = {
      lineHeight: '1rem',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };

    async function loadLeaderboard(r, url) {
      resolution.value = r;
      const { data } = await axios.get(
        url ||
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/phone/leaderboard?resolution=${resolution.value}`,
      );

      const lb = data.results || data;
      next.value = data.next;
      previous.value = data.previous;

      await getUsers(lb.map((ranking) => ranking.user));
      leaderboard.value = lb;
      for (const ranking of leaderboard.value) {
        ranking.user = getUser(ranking.user);
      }

      buildLeaderboard();
    }

    async function getUsers(userIds) {
      await User.api().get(`/users?id__in=${userIds.join(',')}`, {
        dataKey: 'results',
      });
    }

    function buildLeaderboard() {
      for (const ranking of leaderboard.value) {
        if (agentStats.value) {
          const agentState = agentStats.value.find(
            (u) => String(u.user) === String(ranking.user.id),
          );
          ranking.state =
            AGENT_STATES[agentState ? agentState.state : 'OFFLINE'];
          ranking.state_at = agentState ? agentState.state_at : null;
        }

        ranking.total = ranking.inbound_calls + ranking.outbound_calls;
      }

      leaderboard.value.sort((a, b) => b.total - a.total);
      leaderboard.value = [...leaderboard.value];
    }

    function getLanguageTags(locale) {
      return locale.split('#');
    }

    function getUser(id) {
      return User.find(id);
    }

    async function onDropdownUpdate(value) {
      await loadLeaderboard(value);
    }

    onBeforeMount(() => {
      const { socket: s } = useWebSockets(
        '/ws/phone_stats',
        'phone_stats',
        (data) => {
          agentStats.value = data;
        },
      );
      socket.value = s;
    });

    onMounted(async () => {
      await loadLeaderboard(resolution.value);
    });

    onBeforeUnmount(() => {
      socket.value.close();
    });

    const dropdownProps = computed(() => {
      return {
        label: 'name',
        itemKey: 'key',
        value: resolution.value,
        options: [
          {
            key: LEADERBOARD_RESOLUTIONS.DAILY,
            name: t('phoneDashboard.today'),
          },
          {
            key: LEADERBOARD_RESOLUTIONS.WEEKLY,
            name: t('phoneDashboard.this_week'),
          },
          {
            key: LEADERBOARD_RESOLUTIONS.ALL_TIME,
            name: t('phoneDashboard.all_time'),
          },
        ],
      };
    });

    watch(
      () => agentStats.value,
      (agents) => {
        buildLeaderboard();
        if (agents) {
          emitter.emit(
            'phone:agents_online',
            agents.filter((agent) => agent.state === 'AVAILABLE').length,
          );
        }
      },
    );

    return {
      leaderboard,
      previous,
      next,
      resolution,
      nameTextStyle,
      socket,
      agentStats,
      loadLeaderboard,
      getUsers,
      onDropdownUpdate,
      getLanguageTags,
      dropdownProps,
      momentFromNow,
      padStart,
      truncate,
    };
  },
});
</script>
