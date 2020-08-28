<template>
  <Loader :loading="loading" class="root h-full">
    <template #content>
      <phone-layout>
        <template #grid-start>
          <div class="grid--start">
            <agent-block />
          </div>
        </template>
        <template #grid-main>
          <div class="grid--main w-auto">
            <div class="dash-grid h-full">
              <div class="grid--leader">
                <leaderboard />
              </div>
              <div class="grid--train">
                <NewsTrainingCard
                  @phone:showTraining="
                    ($event) => (isShowingTrainingModal = $event)
                  "
                />
              </div>
              <div class="grid--history">
                <CallHistory />
              </div>
            </div>
          </div>
          <div class="grid--footer">
            <div v-if="currentUser.isAdmin" class="contact-container">
              <ContactTable />
            </div>
          </div>
        </template>
      </phone-layout>
      <TrainingModal
        :visible="isShowingTrainingModal"
        @onClose="isShowingTrainingModal = false"
        @onComplete="onTrainingComplete"
      ></TrainingModal>
    </template>
  </Loader>
</template>

<script>
import User from '@/models/User';
import Loader from '@/components/Loader.vue';
import Leaderboard from '@/components/phone/Widgets/Leaderboard.vue';
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import CallHistory from '@/components/phone/Widgets/CallHistory.vue';
import ContactTable from '@/components/phone/Widgets/ContactTable.vue';
import NewsTrainingCard from '@/components/phone/Widgets/NewsTrainingCard.vue';
import TrainingModal from '@/components/phone/TrainingsModal.vue';

export default {
  name: 'Phone',
  components: {
    PhoneLayout,
    AgentBlock,
    Loader,
    CallHistory,
    NewsTrainingCard,
    Leaderboard,
    ContactTable,
    TrainingModal,
  },
  data() {
    return {
      loading: false,
      isShowingTrainingModal: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  methods: {
    async onTrainingComplete() {
      this.$emit('phone:showTrainingModal', false);
    },
  },
};
</script>

<style scoped lang="scss">
$areas: leader train history;

.phonegrid {
  &.grid-container {
    grid:
      [r1] 'start main' [r1end]
      [r2] 'footer footer' [r2end]
      / 1fr 3.75fr;
  }
}

.grid--main {
  .dash-grid {
    display: inline-grid;
    grid-gap: 2rem;
    width: 100%;
    padding-right: 2rem;
    grid:
      [r1] 'leader train' 1.25fr [r1end]
      [r2] 'history history' 2.75fr [r2end]
      / 1fr 1fr;
    .grid {
      @each $area in $areas {
        &--#{$area} {
          grid-area: $area;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }
}

.contact-container {
  padding-right: 2rem;
  @apply bg-crisiscleanup-light-grey;
}
</style>
