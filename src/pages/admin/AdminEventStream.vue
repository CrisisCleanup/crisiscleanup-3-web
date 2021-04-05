<template>
  <div>
    <base-button icon="sync" :action="getEvents" />
    <ul class="list-none m-0 p-0">
      <li :key="stream.event_key" v-for="stream in eventStream" class="mb-2">
        <div class="flex items-center mb-1">
          <div class="bg-gray-500 rounded-full h-4 w-4"></div>
          <div class="flex-1 ml-2 font-medium">
            <span v-if="showUser"
              >{{ stream.attr.actor_first_name }} from
              {{ stream.attr.actor_organization_name }}
            </span>
            {{ getTranslation(stream.past_tense_t, stream.attr) }} ({{
              stream.actor_location_name
            }}
            {{ stream.patient_location_name }}
            {{ stream.recipient_location_name }})
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      eventStream: [],
      showUser: false,
    };
  },
  async mounted() {
    await this.getEvents();
  },
  methods: {
    getTranslation(tag, attr) {
      return this.$t(tag, attr);
    },
    async getEvents() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/event_stream?limit=500`,
      );
      this.eventStream = response.data.results;
    },
  },
};
</script>

<style></style>
