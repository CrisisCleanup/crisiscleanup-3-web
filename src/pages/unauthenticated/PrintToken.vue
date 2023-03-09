<template>
  <div
    id="top"
    class="logo flex items-center justify-between p-3 border border-b"
  >
    <img
      id="header"
      src="@/assets/ccu-logo-black-500w.png"
      style="height: 53px"
    />
    <IncidentContact class="w-48" />
  </div>
  <div class="flex flex-col items-center p-3 mt-8">
    <div class="grid--top">
      <div class="text-5xl">
        {{ $t('printToken.thank_you_for_helping') }}
      </div>
      <div class="text-2xl font-light">
        <div>
          {{ $t('printToken.case_number') }}:
          {{ printToken.case_number }}
        </div>
        <div>
          {{ $t('printToken.resident_name') }}:
          {{ printToken.case_name }}
        </div>
        <div>{{ $t('printToken.address') }}: {{ fullAddress }}</div>
      </div>
    </div>
    <div class="grid--main">
      <div v-if="loading" class="flex h-screen items-center justify-center">
        <font-awesome-icon size="xl" icon="spinner" spin />
      </div>
      <div v-else class="flex flex-col items-center">
        <div class="w-full grid grid-cols-2">
          <div
            v-for="work_type in printToken.work_types"
            :key="`${work_type.id}`"
            class="mx-1"
          >
            <span class="text-sm">
              {{ getWorkTypeName(work_type.work_type) }}
            </span>
            <WorksiteStatusDropdown
              class="block text-xl"
              :current-work-type="work_type"
              use-icon
              @input="
                (value) => {
                  work_type.status = value;
                }
              "
            />
          </div>
        </div>
        <form ref="form" class="w-full grid grid-flow-row" autocomplete="off">
          <span class="text-sm">{{ $t('printToken.notes') }}</span>
          <textarea
            v-model="printToken.status_notes"
            rows="3"
            class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 resize-none"
          />

          <span class="text-sm">{{ $t('printToken.num_volunteers') }}</span>
          <base-input v-model="printToken.number_of_volunteers" type="number" />

          <span class="text-sm">{{
            $t('printToken.hours_per_volunteer')
          }}</span>
          <base-input
            v-model="printToken.hours_per_volunteer"
            type="number"
            pattern="^\d*(\.\d{0,2})?$"
          />

          <span class="text-sm">{{ $t('printToken.your_email') }}</span>
          <base-input v-model="printToken.email" type="email" />

          <div>
            <base-text>{{ $t('printToken.photos') }}</base-text>
            <WorksiteImageSection
              :key="printToken.files"
              :worksite="printToken"
              :is-print-token="true"
              @photosChanged="reloadFiles"
            />
          </div>
        </form>
        <base-button
          variant="solid"
          :action="save"
          class="my-2 font-light p-5 w-full"
          :text="$t('actions.save')"
          :alt="$t('actions.save')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import WorksiteStatusDropdown from '../../components/WorksiteStatusDropdown.vue';
import { getErrorMessage } from '../../utils/errors';
import Home from '@/layouts/Home.vue';
import WorksiteImageSection from '@/components/work/WorksiteImageSection.vue';
import { getWorkTypeName } from '@/filters/index';
import IncidentContact from '@/components/IncidentContact.vue';

export default {
  name: 'PrintToken',
  components: {
    IncidentContact,
    WorksiteImageSection,
    Home,
    WorksiteStatusDropdown,
  },
  setup() {
    const route = useRoute();
    const $toasted = useToast();
    const { t } = useI18n();

    const printToken = ref({});
    const loading = ref(false);

    const fullAddress = computed(() => {
      const {
        address,
        city,
        state,
        postal_code: postalCode,
      } = printToken.value;
      return `${address}${address ? ', ' : ''}${city}, ${state} ${postalCode}`;
    });

    async function reloadFiles() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/print_tokens/${
            route.params.token
          }`,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        printToken.value.files = response.data.files;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    async function getPrintToken() {
      loading.value = true;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/print_tokens/${
            route.params.token
          }`,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        printToken.value = response.data;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    }
    async function save() {
      try {
        const data = {
          ...printToken.value,
        };
        for (const workType of data.work_types) {
          delete workType.work_type;
        }
        await axios.patch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/print_tokens/${
            route.params.token
          }`,
          data,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        await getPrintToken();
        await $toasted.success(t('printToken.success_update_case'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    onMounted(async () => {
      await getPrintToken();
    });

    return {
      printToken,
      loading,
      getWorkTypeName,
      fullAddress,
      save,
      reloadFiles,
    };
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      '. top top top top top'
      '. main main main main main'
      '. main main main main main'
      '. main main main main main';
  }
}

.input {
  @apply m-1;
}
</style>
