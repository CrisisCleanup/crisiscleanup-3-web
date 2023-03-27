<template>
  <form class="p-4">
    <div class="form-row flex w-full">
      <FloatingInput
        v-model="currentIncident.name"
        class="mr-2 w-3/4 sm:w-full"
        :placeholder="$t('incidentBuilder.incident_name')"
        required
      />
    </div>
    <div class="form-row flex flex-col gap-2 sm:flex-row w-full">
      <FloatingInput
        v-model="currentIncident.short_name"
        class="flex-1"
        :placeholder="$t('incidentBuilder.incident_short_name')"
        required
      />
      <base-select
        v-model="currentIncident.timezone"
        :options="timezoneNames"
        class="flex-1"
        :placeholder="$t('incidentBuilder.timezone')"
        searchable
        select-classes="bg-white outline-none w-full h-14"
      />
    </div>
    <div class="form-row flex">
      <datepicker
        v-model="currentIncident.start_at"
        :timezone="currentIncident.timezone"
        :placeholder="$t('actions.start')"
        class="h-12 mr-2"
        v-bind="datePickerDefaultProps"
      ></datepicker>
      <base-button
        :text="$t('actions.start_now')"
        class="min-w-max px-3"
        variant="solid"
        :action="
          () => {
            currentIncident.start_at = new Date();
          }
        "
      />
    </div>
    <div class="form-row">
      <base-select
        v-model="currentIncident.incident_type"
        :options="incidentTypeOptions"
        searchable
        class="bg-white"
        select-classes="w-3/4 sm:w-full h-12 outline-none"
        item-key="value"
        label="name_t"
        :placeholder="$t('incidentBuilder.incident_type')"
      />
    </div>

    <div class="form-row">
      <base-checkbox v-model="currentIncident.auto_contact" class="mb-3">
        {{ $t('incidentBuilder.auto_contact') }}
      </base-checkbox>

      <base-checkbox v-model="currentIncident.turn_on_release" class="mb-3">
        {{ $t('incidentBuilder.turn_on_release') }}
      </base-checkbox>

      <base-checkbox v-model="currentIncident.is_archived" class="mb-3">
        {{ $t('incidentBuilder.archived') }}
      </base-checkbox>
    </div>

    <hr class="mb-4" />
    <base-checkbox v-model="currentAni.use_hotline" class="mb-3">
      {{ $t('incidentBuilder.use_hotline') }}
    </base-checkbox>

    <div class="my-4">
      <div
        v-for="aniIncident in aniIncidents"
        :key="aniIncident.ani"
        class="flex"
      >
        {{ aniIncident.phone_number }}
        <ccu-icon
          :alt="$t('actions.delete')"
          size="small"
          type="trash"
          class="ml-2"
          @click="$emit('onDeleteAniIncident', aniIncident.id)"
        />
      </div>
    </div>

    <template v-if="currentAni.use_hotline">
      <div class="form-row flex w-full">
        <base-select
          :key="aniList"
          :model-value="currentAni.anis"
          :options="aniList"
          searchable
          multiple
          class="bg-white flex-grow mr-2"
          item-key="id"
          label="number"
          :placeholder="$t('incidentBuilder.phone_numbers')"
          @update:modelValue="
            (value: string) => {
              currentAni.anis = [];
              currentAni.anis = [...value];
            }
          "
        />
        <base-select
          v-model="currentAni.timezone"
          :options="timezoneNames"
          class="w-44"
          :placeholder="$t('incidentBuilder.timezone')"
          searchable
        />
        <ccu-icon
          :alt="$t('incidentBuilder.add_ani')"
          type="active"
          size="medium"
          class="ml-3 min-w-max"
          @click="addNewAni"
        />
      </div>
      <div class="form-row flex">
        <datepicker
          v-model="currentAni.start_at"
          :timezone="currentAni.timezone"
          :placeholder="$t('actions.start')"
          v-bind="datePickerDefaultProps"
        ></datepicker>
        <base-button
          :text="$t('actions.start_now')"
          class="min-w-max px-3"
          variant="solid"
          :action="
            () => {
              currentAni.start_at = new Date();
            }
          "
        />
      </div>
      <div class="form-row flex">
        <datepicker
          v-model="currentAni.end_at"
          :timezone="currentAni.timezone"
          :placeholder="$t('actions.end')"
          v-bind="datePickerDefaultProps"
        ></datepicker>
      </div>
    </template>
  </form>
</template>

<script lang="ts">
import { parsePhoneNumber } from 'libphonenumber-js';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import moment from 'moment-timezone';
import { cloneDeep } from 'lodash';
import FloatingInput from '@/components/FloatingInput.vue';
import { formatNationalNumber } from '@/filters';
import { getErrorMessage } from '@/utils/errors';
import useDialogs from '@/hooks/useDialogs';
import type Incident from '@/models/Incident';
import type { VueDatePicker } from '@vuepic/vue-datepicker';

const INCIDENT_TYPES = [
  'contaminated_water',
  'snow',
  'volcano',
  'flood',
  'hurricane',
  'flood_tornado_wind',
  'ice_storm',
  'wind',
  'tornado',
  'mudslide',
  'fire',
  'earthquake',
  'tropical_storm',
  'hail',
  'virus',
  'flood_tstorm',
  'rebuild',
];

interface Ani {
  id: string;
  ani?: string;
  number?: string;
  phone_number?: string;
}

export default defineComponent({
  name: 'IncidentForm',
  components: { FloatingInput },
  props: {
    incident: {
      type: Object,
      default: () => ({}),
    },
    aniIncidents: {
      type: Array<Ani>,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const { prompt } = useDialogs();
    const $toasted = useToast();
    const { t } = useI18n();

    const datePickerDefaultProps = reactive<VueDatePicker>({
      format: 'yyyy-MM-dd HH:mm:ss',
      autoApply: true,
      enableSeconds: true,
    });
    const incidentTypeOptions = INCIDENT_TYPES.map((key) => {
      return {
        value: key,
        name_t: t(`incidentTypes.${key}`),
      };
    });

    const timezoneNames = moment.tz.names();

    const currentIncident = ref<Partial<Incident>>({
      name: '',
      short_name: '',
      timezone: '',
      incident_type: '',
      is_archived: false,
      turn_on_release: false,
      auto_contact: true,
      start_at: '',
    });
    const currentAni = ref<Record<string, any>>({
      anis: [],
      start_at: null,
      end_at: null,
      timezone: '',
      use_hotline: false,
    });
    const aniList = ref<Ani[]>([]);

    async function addNewAni() {
      const result = await prompt({
        title: t('incidentBuilder.add_new_ani'),
        content: t('incidentBuilder.enter_new_ani'),
      });

      if (result) {
        let parsedPhoneNumber;
        try {
          parsedPhoneNumber = parsePhoneNumber(result as string);
        } catch (error: any) {
          await $toasted.error(error.message);
          return;
        }
        try {
          const { data }: { data: Ani } = await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/ani`,
            {
              ani: parsedPhoneNumber.nationalNumber,
              area_code: parsedPhoneNumber.nationalNumber.slice(0, 3),
            },
          );

          aniList.value = [
            {
              id: data.id,
              number: formatNationalNumber(String(data.ani)),
            },
            ...aniList.value,
          ];
          currentAni.value.anis = [data.id, ...currentAni.value.anis];
        } catch (error) {
          await $toasted.error(getErrorMessage(error));
        }
      }
    }

    watch(
      () => cloneDeep(currentIncident.value),
      (value) => {
        emit('onIncidentChange', value);
      },
    );

    watch(
      () => cloneDeep(currentAni.value),
      (value) => {
        emit('onAniChange', value);
      },
    );

    onMounted(async () => {
      if (props.incident) {
        currentIncident.value = { ...props.incident };
        if (props.aniIncidents.length > 0) {
          currentAni.value.use_hotline = true;
          currentAni.value = { ...currentAni.value };
        }
      }
      const aniResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/ani?limit=200`,
      );
      aniList.value = aniResponse.data.results.map((ani: Ani) => {
        return {
          id: ani.id,
          number: formatNationalNumber(String(ani.ani)),
        };
      });
    });

    return {
      currentIncident,
      currentAni,
      aniList,
      addNewAni,
      incidentTypeOptions,
      timezoneNames,
      datePickerDefaultProps,
    };
  },
});
</script>
<style scoped>
.form-row {
  @apply pb-4 w-96;
}
</style>
