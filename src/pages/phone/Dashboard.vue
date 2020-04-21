<template>
  <Loader :loading="loading" class="h-full w-full">
    <template #content>
      <phone-layout>
        <template #grid-start>
          <div class="grid--start">
            <agent-block />
          </div>
        </template>
        <template #grid-main>
          <div class="grid--main w-auto">
            <div class="dash-grid">
              <div class="grid--leader">
                <leaderboard />
              </div>
              <div class="grid--train">
                <training-card
                  :image-path="training.imagePath"
                  :description="training.description"
                  :time-to-complete="training.timeToComplete"
                >
                </training-card>
                <Table :columns="contactsCols" :data="contactMetrics" />
              </div>
            </div>
          </div>
        </template>
      </phone-layout>
    </template>
  </Loader>
</template>

<script>
import User from '@/models/User';
import { mapActions, mapGetters } from 'vuex';
import Loader from '@/components/Loader.vue';
import NewsTrainingCard from '@/components/phone/NewsTrainingCard.vue';
import Leaderboard from '@/components/phone/Leaderboard.vue';
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import Table from '@/components/Table.vue';

export default {
  name: 'Phone',
  components: {
    PhoneLayout,
    AgentBlock,
    Loader,
    Table,

    'training-card': NewsTrainingCard,
    Leaderboard,
  },
  data() {
    return {
      loading: false,
      training: {
        imagePath: require('@/assets/newstrainingss.jpg'),
        description:
          'Then go and tempor incididunt ut labore et dolore magna aliqua.',
        timeToComplete: '10 minutes',
      },
      contactsCols: [
        {
          dataIndex: 'contact_id',
          key: 'contact_id',
          title: 'Contact',
          width: '1fr',
        },
        {
          dataIndex: 'state',
          key: 'state',
          title: 'State',
          width: '1fr',
        },
        {
          dataIndex: 'action',
          key: 'action',
          title: 'Action',
          width: '1fr',
        },
        {
          dataIndex: 'entered_timestamp',
          key: 'entered_timestamp',
          title: 'Timestamp',
          width: '1fr',
        },
        {
          dataIndex: 'agent_id',
          key: 'agent_id',
          title: 'Agent',
          width: '1fr',
        },
      ],
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    ...mapGetters('phone', [
      'connectReady',
      'agentState',
      'contactState',
      'callIncoming',
      'contactMetrics',
    ]),
  },

  methods: {
    ...mapActions('phone', ['getRealtimeMetrics']),
  },
  async mounted() {
    this.loading = true;
    await this.getRealtimeMetrics();
    this.loading = false;
  },
};
</script>

<style scoped lang="scss">
$areas: leader train story;

.grid--main {
  .dash-grid {
    display: inline-grid;
    grid-gap: 2rem;
    grid:
      [r1] 'leader' [r1end]
      [r2] 'train' [r2end]
      [r3] 'story' [r3end]
      / auto;
    .grid {
      @each $area in $areas {
        &--#{$area} {
          grid-area: $area;
        }
      }
    }
  }
}
</style>
