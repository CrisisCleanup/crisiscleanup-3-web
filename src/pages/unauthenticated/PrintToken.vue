<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-overlay>
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
    </template>
    <template #grid-content>
      <div class="grid--main">
        <Loader :loading="loading">
          <template #content>
            <div class="w-2/3 sm:w-screen">
              <div class="flex">
                <div
                  v-for="work_type in printToken.work_types"
                  :key="`${work_type.id}`"
                  class="mx-1"
                >
                  <span class="text-sm">
                    {{ work_type.work_type | getWorkTypeName }}
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
              <form class="w-120 flex flex-col" autocomplete="off" ref="form">
                <span class="text-sm">{{ $t('printToken.notes') }}</span>
                <textarea
                  v-model="printToken.status_notes"
                  rows="3"
                  class="
                    text-base
                    border border-crisiscleanup-dark-100
                    placeholder-crisiscleanup-dark-200
                    outline-none
                    p-2
                    resize-none
                  "
                />

                <span class="text-sm">{{
                  $t('printToken.num_volunteers')
                }}</span>
                <base-input
                  type="number"
                  v-model="printToken.number_of_volunteers"
                />

                <span class="text-sm">{{
                  $t('printToken.hours_per_volunteer')
                }}</span>
                <base-input
                  pattern="^\d*(\.\d{0,2})?$"
                  v-model="printToken.hours_per_volunteer"
                />

                <span class="text-sm">{{ $t('printToken.your_email') }}</span>
                <base-input type="email" v-model="printToken.email" />

                <div>
                  <base-text>{{ $t('~~Photos') }}</base-text>
                  <WorksiteImageSection
                    :worksite="printToken"
                    :key="printToken.files"
                    :is-print-token="true"
                    @photosChanged="reloadFiles"
                  />
                </div>
              </form>
              <base-button
                variant="solid"
                :action="save"
                class="my-2 font-light p-5 w-120"
                :text="$t('actions.save')"
                :alt="$t('actions.save')"
              />
            </div>
          </template>
        </Loader>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
import WorksiteStatusDropdown from '../../components/WorksiteStatusDropdown';
import Loader from '../../components/Loader';
import { getErrorMessage } from '../../utils/errors';
import WorksiteImageSection from '@/components/WorksiteImageSection';

export default {
  components: {
    WorksiteImageSection,
    HomeLayout,
    WorksiteStatusDropdown,
    Loader,
  },
  name: 'PrintToken',
  async mounted() {
    await this.getPrintToken();
  },
  computed: {
    fullAddress() {
      const { address, city, state, postal_code: postalCode } = this.printToken;
      return `${address}, ${city}, ${state} ${postalCode}`;
    },
  },
  methods: {
    async reloadFiles() {
      try {
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/print_tokens/${this.$route.params.token}`,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        this.printToken.files = response.data.files;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
        this.$log.debug(error);
      }
    },
    async getPrintToken() {
      this.loading = true;
      try {
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/print_tokens/${this.$route.params.token}`,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        this.printToken = response.data;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
        this.$log.debug(error);
      } finally {
        this.loading = false;
      }
    },
    async save() {
      try {
        const data = {
          ...this.printToken,
        };
        data.work_types.forEach((workType) => {
          delete workType.work_type;
        });
        await this.$http.patch(
          `${process.env.VUE_APP_API_BASE_URL}/print_tokens/${this.$route.params.token}`,
          data,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        await this.getPrintToken();
        await this.$toasted.success(this.$t('printToken.success_update_case'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  data() {
    return {
      printToken: {},
      loading: false,
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
