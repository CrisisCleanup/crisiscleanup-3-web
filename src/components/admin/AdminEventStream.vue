<template>
  <base-select
    :model-value="filterEvents"
    multiple
    searchable
    :options="events.map((e) => e.key)"
    class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
    :placeholder="$t('adminDashboard.filter_by_event')"
    @update:modelValue="
      (value) => {
        filterEvents = [];
        filterEvents = [...value];
      }
    "
  />
  <base-button icon="sync" :action="getEventLogs" />
  <ul class="list-none m-0 p-0">
    <li v-for="stream in eventStream" :key="stream.event_key" class="mb-2">
      <div v-if="stream.attr" class="grid grid-flow-col auto-cols-max">
        <div class="bg-gray-500 rounded-full h-4 w-4 mr-2"></div>
        <span class="w-72 sm:w-full"
          ><span v-if="showUser"
            ><span
              class="underline text-primary-dark cursor-pointer"
              @click="
                () => {
                  showUserEvents(
                    stream.actor_id,
                    `${stream.attr.actor_first_name} ${stream.attr.actor_last_name}`,
                  );
                }
              "
              >{{ stream.attr.actor_first_name }}
              {{ stream.attr.actor_last_name }}</span
            >
            from
            <span>{{ stream.attr.actor_organization_name }}</span>
          </span>
          <span class="ml-1">
            <strong>{{
              getTranslation(stream.past_tense_t, stream.attr)
            }}</strong>
            ({{ stream.actor_location_name }}
            {{ stream.patient_location_name }}
            {{ stream.recipient_location_name }})
          </span>
        </span>
        <span class="text-xs text-crisiscleanup-grey-700 mx-2">{{
          momentFromNow(stream.created_at)
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
          :text="$t('adminDashboard.show_attrs')"
          :alt="$t('adminDashboard.show_attrs')"
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
          :text="$t('adminDashboard.show_all_fields')"
          :alt="$t('adminDashboard.show_all_fields')"
        />
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { getQueryString } from '../../utils/urls';
import useDialogs from '../../hooks/useDialogs';
import { momentFromNow } from '../../filters';
import JsonWrapper from '../JsonWrapper.vue';

const AdminEventStream = defineComponent({
  props: {
    user: {
      type: Number,
      default: null,
    },
    limit: {
      type: Number,
      default: 100,
    },
  },
  setup(props) {
    const { component } = useDialogs();
    const { t } = useI18n();
    const eventStream = ref<any[]>([]);
    const events = ref<any[]>([]);
    const filterEvents = ref([]);
    const showUser = ref(true);
    const loading = ref(false);

    function getTranslation(tag: string, attr: Record<string, string>) {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]) => [
          key,
          key.endsWith('_t') ? t(value || '') : value,
        ]),
      );

      return t(tag, translated_attrs);
    }
    const getEvents = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/events?limit=500`,
      );
      events.value = [...response.data.results];
    };
    const getEventLogs = async () => {
      eventStream.value = [];
      const query: Record<any, any> = {
        limit: props.limit,
        event_key__in: filterEvents.value.join(','),
      };
      if (props.user) {
        query.created_by = props.user;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/all_events?${getQueryString(
          query,
        )}`,
      );
      eventStream.value = [...response.data.results];
    };
    const showUserEvents = async (userId: string, name: string) => {
      await component({
        title: `Events for User ${userId}: ${name}`,
        component: AdminEventStream,
        classes: 'w-full h-96 overflow-auto',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          user: userId,
          limit: 200,
        } as any,
      });
    };
    const showEventAttrs = async (stream: Record<string, any>) => {
      await component({
        title: `Event Attributes for Log: ${stream.id} | Key: ${stream.event_key}`,
        component: JsonWrapper,
        classes: 'w-full h-96',
        props: {
          jsonData: stream.attr,
        } as any,
      });
    };
    const showAll = async (stream: Record<string, any>) => {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/event_stream/${stream.id}`,
      );
      await component({
        title: `All Fields for Log: ${stream.id} | Key: ${stream.event_key}`,
        component: JsonWrapper,
        classes: 'w-full h-96',
        props: {
          jsonData: response.data,
        } as any,
      });
    };

    onMounted(async () => {
      loading.value = true;
      await getEvents();
      await getEventLogs();
      loading.value = false;
    });

    return {
      eventStream,
      events,
      filterEvents,
      showUser,
      loading,
      getTranslation,
      showUserEvents,
      showEventAttrs,
      showAll,
      momentFromNow,
    };
  },
});
export default AdminEventStream;
</script>

<style>
strong {
  @apply font-bold;
}
</style>
