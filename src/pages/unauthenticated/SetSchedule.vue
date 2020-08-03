<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main">
        <Loader :loading="false">
          <template #content>
            <div>
              <div v-if="schedule" class="text-center text-2xl">
                {{ $t('~~Set availability for') }} {{ schedule.name }}
              </div>

              <AvailabiltyLegend class="p-2" />
              <Schedule
                :schedule-id="$route.params.schedule_id"
                :email="$route.query.email"
                class="p-3"
                hide-cancel
                ref="schedule"
              />
            </div>
          </template>
        </Loader>
      </div>
    </template>
  </HomeLayout>
</template>
<script>
import HomeLayout from '@/layouts/Home';
import Schedule from '../../components/Schedule';
import Loader from '../../components/Loader';
import AvailabiltyLegend from '../AvailabiltyLegend';

export default {
  name: 'SetSchedule',
  components: { AvailabiltyLegend, HomeLayout, Loader, Schedule },
  async mounted() {
    const scheduleResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/schedules/${this.$route.params.schedule_id}`,
    );

    this.schedule = scheduleResponse.data;
  },
  data() {
    return {
      schedule: null,
    };
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    overflow: auto;
    grid-template-areas:
      'logo . . . . survivors'
      'main main main main main main'
      'main main main main main main'
      'main main main main main main';
  }
}
</style>
