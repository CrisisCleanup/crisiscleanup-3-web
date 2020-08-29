<template>
  <TitledCard title="~~Leaderboard">
    <template #right>
      <div class="metric-details flex">
        <base-text
          v-for="t in ['~~In', '~~Out', '~~Total']"
          variant="h4"
          weight="400"
          :key="t"
        >
          {{ $t(t) }}
        </base-text>
      </div>
    </template>
    <Loader :loading="agentMetricsReady" class="card-container overflow-auto">
      <template #content>
        <div v-for="a in agentRankings" :key="a.agent" class="item">
          <div class="item--profile">
            <div class="image">
              <img class="rounded-full" :src="a.user.profilePictureUrl" />
            </div>
            <div class="info">
              <div class="info--user">
                <UserDetailsTooltip
                  :name-class="'text-h3 font-h3 pr-2 text-crisiscleanup-dark-500 name-tooltip'"
                  :user="a.user.id"
                />
                <base-text
                  variant="h3"
                  weight="400"
                  :class="`dot ${getStateFriendlyName(a.currentState).replace(
                    ' ',
                    '',
                  )}`"
                >
                  &#8226; {{ getStateFriendlyName(a.currentState) }}
                </base-text>
                <base-text variant="h4" weight="100">
                  {{ a.enteredTimestamp | moment('from', 'now') }}
                </base-text>
              </div>
              <div class="info--org">
                <base-text variant="bodysm">
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
              <base-text variant="h1" weight="700">
                {{ a[m] }}
              </base-text>
            </div>
          </div>
        </div>
      </template>
    </Loader>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/cards/TitledCard.vue';
import UserDetailsTooltip from '@/components/user/DetailsTooltip.vue';
import Loader from '@/components/Loader.vue';
import { useGetters } from '@u3u/vue-hooks';
import AgentClient from '@/models/phone/AgentClient';

export default {
  name: 'Leaderboard',
  components: {
    TitledCard,
    UserDetailsTooltip,
    Loader,
  },
  setup() {
    return {
      ...useGetters('phone.controller', ['agentRankings', 'agentMetricsReady']),
      getStateFriendlyName(state) {
        return AgentClient.getFriendlyState(state);
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
    @apply px-4 text-crisiscleanup-dark-300;
  }
}

.card-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  scrollbar-width: none;
  max-height: 15rem;

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
    position: relative;
    display: flex;
    flex-grow: 1;
    align-items: baseline;
    @apply p-2;
    &--metrics {
      display: flex;
      align-content: center;
      align-self: center;
      justify-content: space-evenly;
      @apply px-4;
      p {
        @apply px-4;
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
      .image {
        max-width: 2.75rem;
        object-fit: contain;
        border-radius: 50%;
        position: relative;
      }
      .info {
        display: flex;
        flex-direction: column;
        @apply pl-3;
        &--user {
          @each $state, $color in $dot-colors {
            .dot.#{$state} {
              color: theme('colors.crisiscleanup-#{$color}');
              @include truncate;
            }
          }
          display: flex;
          align-items: baseline;
          .v-popover .trigger p span {
            @apply text-crisiscleanup-dark-500 pr-2;
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
