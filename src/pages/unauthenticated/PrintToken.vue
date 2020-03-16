<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main">
        <Loader :loading="loading">
          <template #content>
            <div class="w-2/3">
              <div class="text-5xl">{{ $t('~~Thank you for helping') }}</div>
              <div class="text-2xl font-light">
                <div>
                  {{ $t('~~Case Number') }}: {{ printToken.case_number }}
                </div>
                <div>
                  {{ $t('~~Resident Name') }}: {{ printToken.case_name }}
                </div>
                <div>{{ $t('~~Address') }}: {{ fullAddress }}</div>
              </div>
              <div class="flex">
                <div v-for="work_type in printToken.work_types" class="mx-1">
                  <span class="text-sm">{{
                    work_type.work_type | getWorkTypeName
                  }}</span>
                  <StatusDropDown
                    class="block"
                    :current-work-type="work_type"
                    use-icon
                    @input="
                      value => {
                        work_type.status = value;
                      }
                    "
                  />
                </div>
              </div>
              <form class="w-120 flex flex-col" autocomplete="off" ref="form">
                <span class="text-sm">Notes</span>
                <textarea
                  v-model="printToken.status_notes"
                  rows="3"
                  class="text-base form-field border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 resize-none"
                />

                <span class="text-sm">Number of Volunteers In Your Group</span>
                <base-input
                  type="number"
                  v-model="printToken.number_of_volunteers"
                />

                <span class="text-sm">Estimated Work Hours Per Volunteer</span>
                <base-input
                  type="number"
                  v-model="printToken.hours_per_volunteer"
                />

                <span class="text-sm">Your Email</span>
                <base-input type="email" v-model="printToken.email" />

                <base-button
                  variant="solid"
                  :action="save"
                  class="my-2 font-light p-3"
                  text="Save"
                />
              </form>
            </div>
          </template>
        </Loader>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
import WorkType from '@/models/WorkType';
import Status from '@/models/Status';
import StatusDropDown from '../../components/StatusDropDown';
import Loader from '../../components/Loader';
import { getErrorMessage } from '../../utils/errors';

export default {
  components: { HomeLayout, StatusDropDown, Loader },
  name: 'PrintToken',
  async mounted() {
    this.loading = true;
    await Promise.all([
      WorkType.api().get('/work_types?limit=100', {
        dataKey: 'results',
      }),
      Status.api().get('/statuses?limit=100', {
        dataKey: 'results',
      }),
    ]);
    const response = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/print_tokens/${this.$route.params.token}`,
    );
    this.printToken = response.data;
    this.loading = false;
  },
  computed: {
    fullAddress() {
      const { address, city, state, postal_code } = this.printToken;
      return `${address}, ${city}, ${state} ${postal_code}`;
    },
  },
  methods: {
    async save() {
      try {
        const data = {
          ...this.printToken,
        };
        data.work_types.forEach(work_type => {
          delete work_type.work_type;
        });
        await this.$http.patch(
          `${process.env.VUE_APP_API_BASE_URL}/print_tokens/${this.$route.params.token}`,
          data,
        );
        await this.$toasted.success(this.$t('~~Successfully updated case'));
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
      '. main main main main main'
      '. main main main main main'
      '. main main main main main';
  }
}

.input {
  @apply m-1;
}
</style>
