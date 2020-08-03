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
              <div>{{ $refs.schedule && $refs.schedule.name }}</div>
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

export default {
  name: 'SetSchedule',
  components: { HomeLayout, Loader, Schedule },
  async mounted() {
    const scheduleResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/schedules/${this.$route.params.schedule_id}`,
    );

    this.schedule = scheduleResponse.data;
  },
  data() {
    return {
      schedule: null
    }
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'main main main main main main'
      'main main main main main main'
      'main main main main main main';
  }
}
</style>
