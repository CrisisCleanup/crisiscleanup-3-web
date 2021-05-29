<template>
  <div>
    <base-button icon="sync" :action="getEvents" />
    <ul class="list-none m-0 p-0">
      <li :key="stream.event_key" v-for="stream in eventStream" class="mb-2">
        <div v-if="stream.attr" class="grid grid-flow-col auto-cols-max">
          <div class="bg-gray-500 rounded-full h-4 w-4 mr-2"></div>
          <span class=""
            ><span v-if="showUser"
              ><span
                >{{ stream.attr.actor_first_name }}
                {{ stream.attr.actor_last_name }}</span
              >
              from
              <span>{{ stream.attr.actor_organization_name }}</span>
            </span>
            <span>
              <strong>{{
                getTranslation(stream.past_tense_t, stream.attr)
              }}</strong>
              ({{ stream.actor_location_name }}
              {{ stream.patient_location_name }}
              {{ stream.recipient_location_name }})
            </span>
          </span>
          <span class="text-xs text-crisiscleanup-grey-700 mx-2">{{
            stream.created_at | moment('from', 'now')
          }}</span>
          <base-button
            :action="
              () => {
                showEventAttrs(stream);
              }
            "
            variant="solid"
            size="small"
            class="text-xs"
            :text="$t('~~Show Attrs')"
            :alt="$t('~~Show Attrs')"
          />
          <base-button
            :action="
              () => {
                showAll(stream);
              }
            "
            variant="solid"
            size="small"
            class="text-xs mx-2"
            :text="$t('~~Show All Fields')"
            :alt="$t('~~Show All Fields')"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { DialogsMixin } from '@/mixins';

export default {
  data() {
    return {
      eventStream: [],
      showUser: true,
    };
  },
  mixins: [DialogsMixin],
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
    async showEventAttrs(stream) {
      await this.$component({
        title: `Event Attributes for Log: ${stream.id} | Key: ${stream.event_key}`,
        component: 'JsonWrapper',
        classes: 'w-full h-96',
        props: {
          jsonData: stream.attr,
        },
      });
    },
    async showAll(stream) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/event_stream/${stream.id}`,
      );
      await this.$component({
        title: `All Fields for Log: ${stream.id} | Key: ${stream.event_key}`,
        component: 'JsonWrapper',
        classes: 'w-full h-96',
        props: {
          jsonData: response.data,
        },
      });
    },
  },
};
</script>

<style>
strong {
  @apply font-bold;
}
</style>
