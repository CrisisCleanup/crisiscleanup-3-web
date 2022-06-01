<template>
  <form class="p-4">
    <div class="form-row flex w-full">
      <FloatingInput
        class="mr-2 w-3/4 sm:w-full"
        :placeholder="$t('incidentBuilder.incident_name')"
        v-model="currentIncident.name"
        required
      />
    </div>
    <div class="form-row flex flex-col sm:flex-row w-full">
      <FloatingInput
        class="mr-2 w-3/4 sm:w-full"
        :placeholder="$t('incidentBuilder.incident_short_name')"
        v-model="currentIncident.short_name"
        required
      />
      <form-select
        v-model="currentIncident.timezone"
        :options="timezoneNames"
        class="w-3/4 sm:w-44 mt-0.5"
        :placeholder="$t('incidentBuilder.timezone')"
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
        :popover="{ placement: 'bottom', visibility: 'click' }"
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
            :placeholder="$t('actions.start')"
            :value="inputValue"
            v-on="inputEvents"
          />
        </template>
      </vc-date-picker>
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
      <form-select
        v-model="currentIncident.incident_type"
        :options="incidentTypeOptions"
        searchable
        class="bg-white"
        select-classes="w-3/4 sm:w-full h-12 border border-crisiscleanup-dark-100"
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
          @click.native="$emit('onDeleteAniIncident', aniIncident.id)"
        />
      </div>
    </div>

    <template v-if="currentAni.use_hotline">
      <div class="form-row flex w-full">
        <form-select
          :value="currentAni.anis"
          :options="aniList"
          :key="aniList"
          searchable
          multiple
          class="bg-white flex-grow mr-2"
          item-key="id"
          label="number"
          @input="
            (value) => {
              currentAni.anis = [];
              currentAni.anis = [...value];
            }
          "
          select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12"
          :placeholder="$t('incidentBuilder.phone_numbers')"
        />
        <form-select
          v-model="currentAni.timezone"
          :options="timezoneNames"
          class="w-44"
          :placeholder="$t('incidentBuilder.timezone')"
          searchable
          select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12"
        />
        <ccu-icon
          :alt="$t('incidentBuilder.add_ani')"
          type="active"
          size="medium"
          class="ml-3 min-w-max"
          @click.native="addNewAni"
        />
      </div>
      <div class="form-row flex">
        <vc-date-picker
          :key="currentAni.start_at"
          v-model="currentAni.start_at"
          mode="dateTime"
          :timezone="currentAni.timezone"
          :popover="{ placement: 'bottom', visibility: 'click' }"
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
              :placeholder="$t('actions.start')"
              :value="inputValue"
              v-on="inputEvents"
            />
          </template>
        </vc-date-picker>
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
        <vc-date-picker
          :key="currentAni.end_at"
          v-model="currentAni.end_at"
          mode="dateTime"
          :timezone="currentAni.timezone"
          :popover="{ placement: 'bottom', visibility: 'click' }"
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
              :placeholder="$t('actions.end')"
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
import { parsePhoneNumber } from 'libphonenumber-js';
import FloatingInput from '@/components/FloatingInput';
import { formatNationalNumber } from '@/filters';
import { DialogsMixin } from '@/mixins';
import { getErrorMessage } from '@/utils/errors';

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
  mixins: [DialogsMixin],
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
        anis: [],
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
    aniIncidents: {
      type: Array,
      default: () => [],
    },
  },
  async mounted() {
    if (this.incident) {
      this.currentIncident = { ...this.incident };
      if (this.aniIncidents.length > 0) {
        this.currentAni.use_hotline = true;
        this.currentAni = { ...this.currentAni };
      }
    }
    const aniResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/ani?limit=200`,
    );
    this.aniList = aniResponse.data.results.map((ani) => {
      return {
        id: ani.id,
        number: formatNationalNumber(String(ani.ani)),
      };
    });
  },
  methods: {
    async addNewAni() {
      const result = await this.$prompt({
        title: this.$t('incidentBuilder.add_new_ani'),
        content: this.$t('incidentBuilder.enter_new_ani'),
      });

      if (result) {
        let parsedPhoneNumber;
        try {
          parsedPhoneNumber = parsePhoneNumber(result);
        } catch (e) {
          await this.$toasted.error(e.message);
          return;
        }
        try {
          const { data } = await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/ani`,
            {
              ani: parsedPhoneNumber.nationalNumber,
              area_code: parsedPhoneNumber.nationalNumber.slice(0, 3),
            },
          );

          this.aniList = [
            {
              id: data.id,
              number: formatNationalNumber(String(data.ani)),
            },
            ...this.aniList,
          ];
          this.currentAni.anis = [data.id, ...this.currentAni.anis];
        } catch (error) {
          await this.$toasted.error(getErrorMessage(error));
        }
      }
    },
  },
  watch: {
    currentIncident: {
      handler(value) {
        this.$emit('onIncidentChange', value);
      },
      deep: true,
      immediate: true,
    },
    currentAni: {
      handler(value) {
        this.$emit('onAniChange', value);
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
