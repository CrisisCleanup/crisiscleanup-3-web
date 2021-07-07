<template>
  <div>
    <form-select
      :value="filterEvents"
      multiple
      searchable
      :options="events.map((e) => e.key)"
      class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
      @input="
        (value) => {
          filterEvents = [];
          filterEvents = [...value];
        }
      "
      :placeholder="$t('~~Filter By Event')"
    />
    <base-button icon="sync" :action="getEventLogs" />
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
import VueTypes from 'vue-types';
import { getQueryString } from '@/utils/urls';

export default {
  props: {
    user: VueTypes.number,
  },
  data() {
    return {
      eventStream: [],
      events: [],
      filterEvents: [],
      showUser: true,
      loading: false,
    };
  },
  mixins: [DialogsMixin],
  async mounted() {
    this.loading = true;
    await this.getEvents();
    await this.getEventLogs();
    this.loading = false;
  },
  methods: {
    getTranslation(tag, attr) {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]) => [
          key,
          key.endsWith('_t') ? this.$t(value) : value,
        ]),
      );
      return this.$t(tag, translated_attrs);
    },
    async getEvents() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/events?limit=500`,
      );
      this.events = [...response.data.results];
    },
    async getEventLogs() {
      this.eventStream = [];
      const query = {
        limit: 100,
        event_key__in: this.filterEvents.join(','),
      };
      if (this.user) {
        query.created_by = this.user;
      }
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/event_stream?${getQueryString(
          query,
        )}`,
      );
      this.eventStream = [...response.data.results];
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
