<template>
  <modal
    id="outbound_list"
    modal-classes="bg-white max-w-3xl shadow"
    :title="$t('phoneDashboard.remaining_outbounds')"
    @close="$emit('close')"
  >
    <AjaxTable
      :columns="columns"
      class="w-full h-108"
      :url="url"
      :query="query"
      @row-click="handleRowClick"
    >
      <template #phone_number="slotProps">
        {{ slotProps.item.phone_number }}
        <LanguageTag
          class="tag-item mx-1"
          :language-id="slotProps.item.language"
        />
      </template>
    </AjaxTable>
  </modal>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import moment from 'moment';
import { useI18n } from 'vue-i18n';
import { makeTableColumns } from '@/utils/table';
import PhoneOutbound from '@/models/PhoneOutbound';
import Incident from '@/models/Incident';
import Modal from '@/components/Modal.vue';
import AjaxTable from '@/components/AjaxTable.vue';
import { formatNationalNumber } from '@/filters';
import useEmitter from '@/hooks/useEmitter';
import LanguageTag from '@/components/tags/LanguageTag.vue';

export default defineComponent({
  name: 'OutboundsModal',
  components: {
    Modal,
    AjaxTable,
    LanguageTag,
  },
  props: {
    type: {
      type: String,
      default: 'callback',
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { emitter } = useEmitter();

    const columns = ref(
      makeTableColumns([
        ['id', '0.5fr', t('phoneDashboard.id')],
        ['phone_number', '1.5fr', t('phoneDashboard.phone_number')],
        ['number_of_inbound_calls', '0.5fr', t('phoneDashboard.calls')],
        [
          'location',
          '1fr',
          t('phoneDashboard.location'),
          {
            transformer: (_: string, item: PhoneOutbound) =>
              `${item.location_name || ''} ${item.state_name}`,
          },
        ],
        [
          'incident_id',
          '1fr',
          t('phoneDashboard.incident'),
          {
            transformer(field: string[]) {
              const incident = Incident.find(field[0]);
              if (incident) {
                return `${incident.name}`;
              }

              return '';
            },
          },
        ],
        [
          'updated_at',
          '1fr',
          t('phoneDashboard.last_called_at'),
          {
            transformer(field: string) {
              return moment(field).fromNow();
            },
          },
        ],
      ]),
    );
    const url = ref(`${import.meta.env.VITE_APP_API_BASE_URL}/phone_outbound`);
    const query = ref({
      completion__lt: 1,
      filter_ani: 1,
      locked_at__isnull: true,
      call_type: props.type,
    });

    const handleRowClick = (payload) => {
      emitter.emit('phone_component:close');
      emitter.emit('phone_component:open', 'dialer');
      emitter.emit(
        'dialer:set_phone_number',
        formatNationalNumber(payload.phone_number),
      );
      emit('close');
    };

    return {
      columns,
      url,
      query,
      handleRowClick,
    };
  },
});
</script>

<style scoped></style>
