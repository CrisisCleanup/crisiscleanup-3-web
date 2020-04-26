<template>
  <TitledCard title="~~Leaderboard">
    <Loader :loading="loading" class="card-container">
      <template #content>
        <div v-for="a in agentBoard" :key="a.agent" class="item">
          <div class="item--profile">
            <div class="image">
              <img
                class="rounded-full"
                :src="getUser(a.user.id).profilePictureUrl"
              />
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
              </div>
              <div class="info--org">
                <base-text variant="bodysm">
                  {{ a.organization.name }}
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
import TitledCard from '@/components/phone/Cards/TitledCard.vue';
import { UserMixin, AgentMixin } from '@/mixins';
import { mapGetters } from 'vuex';
import UserDetailsTooltip from '@/components/user/DetailsTooltip.vue';
import Loader from '@/components/Loader.vue';

export default {
  name: 'Leaderboard',
  mixins: [UserMixin, AgentMixin],
  components: {
    TitledCard,
    UserDetailsTooltip,
    Loader,
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    ...mapGetters('phone', ['agentBoard']),
    ...mapGetters('socket', ['connected']),
    metricData() {
      return {
        intake: this.agentBoard.map((a) => a.total_inbound),
        return: this.agentBoard.map((a) => a.total_outbound),
        total: this.agentBoard.map((a) => a.total_calls),
      };
    },
  },
  async mounted() {
    await this.$store.watch(
      () => this.connected,
      () => this.$store.dispatch('phone/getAgentMetrics'),
    );
    this.loading = false;
  },
};
</script>

<style lang="scss" scoped>
$dot-colors: (
  'offline': 'red.500',
  'online': 'green.300',
  'talking': 'dark-blue',
  'paused': 'yellow.500',
);

$metric-headers: ('In' 'Out' 'Total');

@mixin truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;

  .item:first-child {
    .item--metrics {
      @for $i from 1 through 3 {
        .metric {
          &:nth-child(#{$i}) {
            position: relative;
            &:before {
              content: nth($metric-headers, $i);
              position: absolute;
              top: -2.25rem;
              left: 0;
              width: 100%;
              text-align: center;
              @apply font-body text-h4 text-crisiscleanup-dark-300;
            }
            &:last-child:before {
              font-weight: 500;
              @apply text-crisiscleanup-dark-400;
            }
          }
        }
      }
    }
  }

  .item {
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
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
      div {
        @apply px-1;
      }
      .image {
        max-width: 3rem;
        object-fit: contain;
        border-radius: 50%;
        position: relative;
      }
      .info {
        display: flex;
        flex-direction: column;
        &--user {
          @each $state, $color in $dot-colors {
            .dot.#{$state} {
              color: theme('colors.crisiscleanup-#{$color}');
              @include truncate;
            }
          }
          display: flex;
          .v-popover .trigger p span {
            @apply text-crisiscleanup-dark-500 pr-2;
            cursor: pointer;
            @include truncate;
          }

          .user-popover p.details-name span,
          p {
            @apply text-crisiscleanup-dark-400 pr-2;
            @include truncate;
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
