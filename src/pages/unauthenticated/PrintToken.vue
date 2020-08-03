<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--main">
        <Loader :loading="loading">
          <template #content>
            <Schedule
              :schedule-id="$route.params.schedule_id"
              :email="$route.query.email"
              class="p-3"
              hide-cancel
            />
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

export default {
  components: { HomeLayout, WorksiteStatusDropdown, Loader },
  name: 'PrintToken',
  async mounted() {
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
        data.work_types.forEach((work_type) => {
          delete work_type.work_type;
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
      '. main main main main main'
      '. main main main main main'
      '. main main main main main';
  }
}

.input {
  @apply m-1;
}
</style>
