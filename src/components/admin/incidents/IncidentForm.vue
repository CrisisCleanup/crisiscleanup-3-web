<template>
  <form class="p-4">
    <div class="form-row flex w-full">
      <FloatingInput
        class="mr-2 flex-grow"
        :placeholder="$t('~~Incident Name')"
        v-model="currentIncident.name"
        required
      />
    </div>
    <div class="form-row flex w-full">
      <FloatingInput
        class="mr-2 flex-grow"
        :placeholder="$t('~~Incident Short Name')"
        v-model="currentIncident.short_name"
        required
      />
      <form-select
        v-model="currentIncident.timezone"
        :options="timezoneNames"
        class="w-44 mt-0.5"
        :placeholder="$t('~~Timezone')"
        searchable
        select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12"
      />
    </div>
    <div class="form-row flex">
      <vc-date-picker
        :key="currentIncident.start_at"
        v-model="currentIncident.start_at"
        mode="dateTime"
        :timezone="currentIncident.timezone"
      >
        <template v-slot="{ inputValue, inputEvents }">
          <input
            class="
              h-12
              p-1
              border border-crisiscleanup-dark-100
              bg-white
              text-sm
              placeholder-crisiscleanup-dark-200
              outline-none
              col-span-2
              mr-2
              flex-1
              text-base
              px-3
            "
            :placeholder="$t('~~Start')"
            :value="inputValue"
            v-on="inputEvents"
          />
        </template>
      </vc-date-picker>
      <base-button
        :text="$t('~~Start Now')"
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
      <form-select
        v-model="currentIncident.incident_type"
        :options="incidentTypeOptions"
        searchable
        class="bg-white"
        select-classes="h-12 border border-crisiscleanup-dark-100"
        item-key="value"
        label="name_t"
        :placeholder="$t('~~Incident Type')"
      />
    </div>

    <div class="form-row">
      <base-checkbox v-model="currentIncident.auto_contact" class="mb-3">
        {{ $t('~~Auto Contact') }}
      </base-checkbox>

      <base-checkbox v-model="currentAni.turn_on_release" class="mb-3">
        {{ $t('~~Turn On Release') }}
      </base-checkbox>

      <base-checkbox v-model="currentAni.is_archived" class="mb-3">
        {{ $t('~~Archived') }}
      </base-checkbox>
    </div>

    <hr class="mb-4" />
    <base-checkbox v-model="currentAni.use_hotline" class="mb-3">
      {{ $t('~~Use Hotline') }}
    </base-checkbox>

    <template v-if="currentAni.use_hotline">
      <div class="form-row flex w-full">
        <form-select
          :value="currentAni.phoneNumbers"
          :options="aniList"
          searchable
          multiple
          class="bg-white flex-grow mr-2"
          item-key="id"
          label="number"
          @input="
            (value) => {
              currentAni.phoneNumbers = [];
              currentAni.phoneNumbers = [...value];
            }
          "
          select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12"
          :placeholder="$t('~~Phone Numbers')"
        />
        <form-select
          v-model="currentIncident.timezone"
          :options="timezoneNames"
          class="w-44"
          :placeholder="$t('~~Timezone')"
          searchable
          select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12"
        />
      </div>
      <div class="form-row flex">
        <vc-date-picker
          :key="currentAni.start_at"
          v-model="currentAni.start_at"
          mode="dateTime"
          :timezone="currentAni.timezone"
        >
          <template v-slot="{ inputValue, inputEvents }">
            <input
              class="
                h-12
                p-1
                border border-crisiscleanup-dark-100
                bg-white
                text-sm
                placeholder-crisiscleanup-dark-200
                outline-none
                col-span-2
                mr-2
                flex-1
                text-base
                px-3
              "
              :placeholder="$t('~~Start')"
              :value="inputValue"
              v-on="inputEvents"
            />
          </template>
        </vc-date-picker>
        <base-button
          :text="$t('~~Start Now')"
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
        <vc-date-picker
          :key="currentAni.end_at"
          v-model="currentAni.end_at"
          mode="dateTime"
          :timezone="currentAni.timezone"
        >
          <template v-slot="{ inputValue, inputEvents }">
            <input
              class="
                h-12
                p-1
                border border-crisiscleanup-dark-100
                bg-white
                text-sm
                placeholder-crisiscleanup-dark-200
                outline-none
                col-span-2
                mr-2
                flex-1
                text-base
                px-3
              "
              :placeholder="$t('~~End')"
              :value="inputValue"
              v-on="inputEvents"
            />
          </template>
        </vc-date-picker>
      </div>
    </template>
  </form>
</template>
<script>
import FloatingInput from '@/components/FloatingInput';
import { formatNationalNumber } from '@/filters';

const INCIDENT_TYPES = [
  'contaminated_water',
  'snow',
  'volcano',
  'flood',
  'hurricane',
  'flood_tornado_wind',
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

export default {
  name: 'IncidentForm',
  components: { FloatingInput },
  data() {
    return {
      currentIncident: {
        name: '',
        short_name: '',
        timezone: '',
        incident_type: '',
        is_archived: false,
        turn_on_release: false,
        auto_contact: true,
        start_at: null,
      },
      currentAni: {
        phoneNumbers: [],
        start_at: null,
        end_at: null,
        timezone: '',
        use_hotline: false,
      },
      aniList: [],
    };
  },
  props: {
    incident: {
      type: Object,
      default: () => ({}),
    },
  },
  async mounted() {
    if (this.incident) {
      this.currentIncident = { ...this.incident };
    }
    const aniResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/ani`,
    );
    this.aniList = aniResponse.data.results.map((ani) => {
      return {
        id: ani.id,
        number: formatNationalNumber(String(ani.ani)),
      };
    });
  },
  watch: {
    currentIncident: {
      handler(value) {
        this.$emit('onIncidentChange', value);
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    timezoneNames() {
      const moment = require('moment-timezone');
      return moment.tz.names();
    },
    incidentTypeOptions() {
      return INCIDENT_TYPES.map((key) => {
        return {
          value: key,
          name_t: this.$t(`incidentTypes.${key}`),
        };
      });
    },
  },
};
</script>
<style scoped>
.form-row {
  @apply pb-4 w-96;
}
</style>
