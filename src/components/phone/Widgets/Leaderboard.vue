<template>
  <TitledCard
    :loading="!agentMetricsReady"
    title="~~Leaderboard"
    class="h-full"
    :dropdown="dropdownProps"
    @update:dropdown="onDropdownUpdate"
  >
    <div class="card-container overflow-auto h-full">
      <div
        v-if="agentMetricsReady"
        class="metric-title flex justify-end px-1 lg:px-6"
      >
        <base-text
          class="text-crisiscleanup-dark-200"
          v-for="t in ['~~Intake', '~~Return', '~~Total']"
          variant="h4"
          :key="t"
          regular
        >
          {{ $t(t) }}
        </base-text>
      </div>
      <div
        v-for="a in agentRankings.filter(rankFilter)"
        :key="a.agent"
        class="item relative"
      >
        <div class="item--profile">
          <div class="image">
            <img class="rounded-full" :src="a.user.profilePictureUrl" />
          </div>
          <div class="info pl-2">
            <div class="info--user">
              <UserDetailsTooltip
                :name-class="'text-h3 font-h3 pr-2 text-crisiscleanup-dark-400 name-tooltip'"
                :user="a.user.id"
                :name-style="nameTextStyle"
              />
              <div class="flex">
                <div
                  class="flex flex-col pr-2"
                  v-for="l in getLanguageTags(a.locale || 'en-US')"
                  :key="l"
                >
                  <LanguageTag class="text-bodyxsm" :language-subtag="l" />
                </div>
              </div>
            </div>
            <div class="info--state pl-1">
              <base-text
                :style="{ lineHeight: '16px' }"
                variant="h3"
                weight="400"
                :class="`dot ${getStateFriendlyName(a.currentState).replace(
                  ' ',
                  '',
                )}`"
              >
                &#8226; {{ getStateFriendlyName(a.currentState) }}
              </base-text>
              <base-text
                :style="{ lineHeight: '16px' }"
                class="pl-2 text-crisiscleanup-dark-300 opacity-50"
                variant="h4"
                regular
              >
                {{ a.enteredTimestamp | moment('from', 'now') }}
              </base-text>
            </div>

            <div class="info--org">
              <base-text :style="{ lineHeight: '16px' }" variant="h4" regular>
                {{ a.organization.name | truncate(28) }}
              </base-text>
            </div>
          </div>
        </div>
        <div class="item--metrics">
          <div
            class="metric"
            v-for="m in ['total_inbound', 'total_outbound', 'total_calls']"
            :key="m"
          >
            <base-text variant="h1" semi-bold>
              {{ a[m] | padStart(2, '0') }}
            </base-text>
          </div>
        </div>
      </div>
    </div>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/cards/TitledCard.vue';
import UserDetailsTooltip from '@/components/user/DetailsTooltip.vue';
import { useGetters } from '@u3u/vue-hooks';
import AgentClient from '@/models/phone/AgentClient';
import LanguageTag from '@/components/tags/LanguageTag.vue';
import { reactive, ref } from '@vue/composition-api';
import useUser from '@/use/user/useUser';

export default {
  name: 'Leaderboard',
  components: {
    TitledCard,
    UserDetailsTooltip,
    LanguageTag,
  },
  setup(props, context) {
    const getters = {
      ...useGetters('phone.controller', ['agentRankings', 'agentMetricsReady']),
    };

    const { currentUser } = useUser();

    const rankFilter = ref((ag) => ag.currentState.includes('online'));

    const dropdownProps = reactive({
      label: 'name',
      itemKey: 'key',
      value: 'online',
      options: [
        {
          key: 'online',
          name: context.root.$t('~~Online'),
        },
        {
          key: 'today',
          name: context.root.$t('~~Today'),
        },
        {
          key: 'week',
          name: context.root.$t('~~This Week'),
        },
        {
          key: 'month',
          name: context.root.$t('~~This Month'),
        },
        {
          key: 'all',
          name: context.root.$t('~~All Time'),
        },
        {
          key: 'english',
          name: context.root.$t('~~English'),
        },
        {
          key: 'spanish',
          name: context.root.$t('~~Spanish'),
        },
        {
          key: 'my-org',
          name: context.root.$t('~~My Organization'),
        },
      ],
    });

    const onDropdownUpdate = (value) => {
      const oneDay = new Date();
      const oneWeek = new Date();
      const oneMonth = new Date();
      oneDay.setDate(oneDay.getDate() - 1);
      oneWeek.setDate(oneWeek.getDate() - 7);
      oneMonth.setMonth(oneMonth.getMonth() - 1);
      switch (value) {
        case 'online':
          rankFilter.value = (ag) => ag.currentState.includes('online');
          break;
        case 'my-org':
          rankFilter.value = (ag) =>
            ag.organization.id === currentUser.value.organization.id;
          break;
        case 'today':
          rankFilter.value = (ag) => ag.enteredTimestamp >= oneDay;
          break;
        case 'week':
          rankFilter.value = (ag) => ag.enteredTimestamp >= oneWeek;
          break;
        case 'month':
          rankFilter.value = (ag) => ag.enteredTimestamp >= oneMonth;
          break;
        case 'english':
          rankFilter.value = (ag) => ag.locale.includes('en');
          break;
        case 'spanish':
          rankFilter.value = (ag) => ag.locale.includes('es');
          break;
        default:
          rankFilter.value = (ag) => ag;
      }
    };

    return {
      ...getters,
      dropdownProps,
      rankFilter,
      onDropdownUpdate,
      getStateFriendlyName(state) {
        return AgentClient.getFriendlyState(state);
      },
      nameTextStyle: {
        lineHeight: '1rem',
      },
      getLanguageTags(locale) {
        return locale.split('#');
      },
    };
  },
};
</script>

<style lang="scss" scoped>
$dot-colors: (
  'offline': 'red.500',
  'online': 'green.300',
  'talking': 'dark-blue',
  'paused': 'yellow.500',
  'connecting': 'teal',
);

$metric-headers: ('In' 'Out' 'Total');

@mixin truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-details {
  .right & {
    margin-bottom: -1.25rem;
  }
  align-self: flex-end;
  text-align: center;
  p {
    &:nth-child(2) {
      @apply pr-3;
    }
    &:last-child {
      font-weight: 500;
      @apply text-crisiscleanup-dark-400;
    }
    text-align: center;
  }
}

.metric-title {
  @apply pt-1;
  text-align: center;
  p {
    &:nth-child(2) {
      @apply px-10;
    }
    &:last-child {
      @apply text-crisiscleanup-dark-400 font-bold #{!important};
    }
  }
}

.card-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  scrollbar-width: none;

  .item:first-of-type {
    padding-top: 0 !important;
  }

  .item {
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0.75rem;
      width: calc(100% - 0.75rem * 2);
      height: 1px;
      opacity: 0.2;
      background-color: #979797;
    }
    display: flex;
    align-items: baseline;

    &:nth-child(2) {
      padding-top: 0 !important;
    }

    @apply p-2;
    &--metrics {
      display: flex;
      align-content: center;
      align-self: center;
      justify-content: space-evenly;
      @apply px-4;
      .metric:nth-child(2) {
        @apply px-12;
      }
      .metric p {
        color: theme('colors.crisiscleanup-dark.300');
      }
      .metric:last-child {
        p {
          color: theme('colors.crisiscleanup-dark.400');
        }
      }
    }
    &--profile {
      display: flex;
      flex-grow: 1;
      align-items: center;
      @apply py-1;
      .image {
        @apply shadow;
        max-width: 2.5vw;
        object-fit: contain;
        border-radius: 50%;
        position: relative;
      }
      .info {
        display: flex;
        flex-direction: column;
        &--user {
          display: flex;
          align-items: baseline;
          .v-popover .trigger p span {
            @apply text-crisiscleanup-dark-400 pr-2;
            cursor: pointer;
            @include truncate;
          }

          .user-popover p.details-name span,
          p {
            @apply text-crisiscleanup-dark-400 pr-2;
            @include truncate;
            &:last-child {
              @apply text-crisiscleanup-dark-300;
            }
          }
        }
        &--state {
          display: flex;
          flex-direction: row;
          @each $state, $color in $dot-colors {
            .dot.#{$state} {
              color: theme('colors.crisiscleanup-#{$color}');
              @include truncate;
            }
          }
          align-items: baseline;
        }
        &--org {
          p {
            @apply text-crisiscleanup-dark-300;
            @include truncate;
          }
        }
      }
    }
  }
}
</style>
