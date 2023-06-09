<template>
  <div>
    <tabs>
      <tab :name="urls.callHistory.name">
        <div>
          <AjaxTable
            :url="urls.callHistory.url"
            :columns="urls.callHistory.columns"
            :body-style="{ height: '16rem' }"
            :enable-pagination="false"
            @rowClick="onRowClick"
          />
        </div>
      </tab>
      <tab :name="urls.inboundHistory.name">
        <div>
          <AjaxTable
            :url="urls.inboundHistory.url"
            :columns="urls.inboundHistory.columns"
            :body-style="{ height: '16rem' }"
            :enable-pagination="false"
            @rowClick="onRowClick"
          />
        </div>
      </tab>
      <tab :name="urls.outboundHistory.name">
        <div>
          <AjaxTable
            :url="urls.outboundHistory.url"
            :columns="urls.outboundHistory.columns"
            :body-style="{ height: '16rem' }"
            :enable-pagination="false"
            @rowClick="onRowClick"
          />
        </div>
      </tab>
      <tab :name="urls.ringCentralHistory.name">
        <div>
          <AjaxTable
            :url="urls.ringCentralHistory.url"
            :columns="urls.ringCentralHistory.columns"
            :body-style="{ height: '16rem' }"
            :enable-pagination="false"
            @rowClick="onRowClick"
          />
        </div>
      </tab>
    </tabs>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { get } from 'lodash';
import type PhoneOutbound from '@/models/PhoneOutbound';
import { hash } from '@/utils/promise';
import AjaxTable from '@/components/AjaxTable.vue';
import JsonWrapper from '@/components/JsonWrapper.vue';
import useDialogs from '@/hooks/useDialogs';
import { makeTableColumns } from '@/utils/table';
import PhoneStatus from '@/models/PhoneStatus';

export default {
  name: 'AgentHistory',
  components: { AjaxTable },
  props: {
    agentId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { component } = useDialogs();

    const urls = {
      callHistory: {
        name: 'Status History',
        url: `${import.meta.env.VITE_APP_API_BASE_URL}/phone_agents/${
          props.agentId
        }/status_history`,
        columns: makeTableColumns([
          ['phone_number', '1fr', 'Phone Number'],
          [
            'status',
            '1fr',
            'Status',
            {
              transformer: (_: string, item) =>
                get(
                  PhoneStatus.find(item.status),
                  'substatus_name_t',
                  'Unknown',
                ),
            },
          ],
          ['notes', '2fr', 'Notes'],
          ['created_at', '1fr', 'Created At'],
        ]),
      },
      inboundHistory: {
        name: 'Inbound History',
        url: `${import.meta.env.VITE_APP_API_BASE_URL}/phone_agents/${
          props.agentId
        }/inbound_history`,
        columns: makeTableColumns([
          ['ani', '1fr', 'Ani'],
          ['dnis', '1fr', 'Dnis'],
          ['call_at', '1fr', 'Call At'],
        ]),
      },
      outboundHistory: {
        name: 'Outbound History',
        url: `${import.meta.env.VITE_APP_API_BASE_URL}/phone_agents/${
          props.agentId
        }/outbound_history`,
        columns: makeTableColumns([
          ['phone_number', '1fr', 'Phone Number'],
          [
            'latest_status',
            '1fr',
            'Latest Status',
            {
              transformer: (_: string, item: PhoneOutbound) =>
                get(
                  PhoneStatus.find(item.latest_status),
                  'substatus_name_t',
                  'Unknown',
                ),
            },
          ],
          ['completion', '1fr', 'Completion'],
          ['updated_at', '1fr', 'Updated At'],
        ]),
      },
      ringCentralHistory: {
        name: 'RingCentral History',
        url: `${import.meta.env.VITE_APP_API_BASE_URL}/phone_agents/${
          props.agentId
        }/ringcentral_history`,
        columns: makeTableColumns([
          ['agent_id', '1fr', 'Agent Id'],
          ['username', '1fr', 'Username'],
          ['agent_phone', '1fr', 'Agent Phone'],
          ['event_type', '1fr', 'Event Type'],
          ['prev_state', '1fr', 'Prev State'],
          ['call_state', '1fr', 'Call State'],
          ['created_at', '1fr', 'Created At'],
        ]),
      },
    };

    const onRowClick = async (item) => {
      await component({
        title: `Item detail`,
        component: JsonWrapper,
        classes: 'w-full h-96',
        props: {
          jsonData: item,
        } as any,
      });
    };

    return {
      urls,
      onRowClick,
    };
  },
};
</script>
