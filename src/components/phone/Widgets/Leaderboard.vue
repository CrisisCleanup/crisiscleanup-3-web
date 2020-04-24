<template>
  <TitledCard title="Leaderboard">
    <div class="card-container">
      <div v-for="a in agentBoard" :key="a.agent" class="item">
        <div class="item--profile">
          <div class="image">
            <img class="rounded-full" :src="currentUser.profilePictureUrl" />
          </div>
          <div class="info">
            <div class="info--user">
              <base-text variant="h3">
                {{ `${a.user.first_name} ${a.user.last_name}` }}
              </base-text>
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
          <div class="metric">
            <base-text variant="h2">
              {{ a.total_inbound }}
            </base-text>
          </div>
          <div class="metric">
            <base-text variant="h2">
              {{ a.total_outbound }}
            </base-text>
          </div>
          <div class="metric">
            <base-text variant="h2">
              {{ a.total_calls }}
            </base-text>
          </div>
        </div>
      </div>
    </div>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/phone/Cards/TitledCard.vue';
import { UserMixin, AgentMixin } from '@/mixins';
import { mapGetters } from 'vuex';

export default {
  name: 'Leaderboard',
  mixins: [UserMixin, AgentMixin],
  components: {
    TitledCard,
  },
  computed: {
    ...mapGetters('phone', ['agentBoard']),
    metricData() {
      return {
        intake: this.agentBoard.map((a) => a.total_inbound),
        return: this.agentBoard.map((a) => a.total_outbound),
        total: this.agentBoard.map((a) => a.total_calls),
      };
    },
    metricHeaders() {
      return {
        intake: this.$t('~~Intake'),
        return: this.$t('~~Return'),
        total: this.$t('~~Total'),
      };
    },
  },
  async mounted() {
    await this.$store.dispatch('phone/getAgentMetrics');
  },
};
</script>

<style lang="scss" scoped>
$dot-colors: (
  'offline': 'red.500',
  'online': 'green.300',
  'oncall': 'dark-blue',
  'paused': 'yellow.500',
);

$metric-headers: ('Invoke' 'Return' 'Total');

.card-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;

  .item:first-child {
    @apply my-2;
    .item--metrics {
      @for $i from 1 through 3 {
        .metric {
          &:nth-child(#{$i}) {
            position: relative;
            &:before {
              content: nth($metric-headers, $i);
              position: absolute;
              top: -1.5rem;
              left: 0;
              width: 100%;
              text-align: center;
              @apply font-body text-h4 text-crisiscleanup-dark-300;
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
    @apply p-4;
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
    }
    &--profile {
      display: flex;
      flex-grow: 1;
      align-items: center;
      div {
        @apply px-1;
      }
      .image {
        max-width: 10%;
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
            }
          }
          display: flex;
          p {
            @apply text-crisiscleanup-dark-400 pr-2;
          }
        }
        &--org {
          p {
            @apply text-crisiscleanup-dark-300;
          }
        }
      }
    }
  }
}
</style>
