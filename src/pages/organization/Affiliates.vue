<template>
  <div class="flex h-full w-3/4 m-auto">
    <div class="mt-6 px-12 w-full bg-white shadow">
      <div class="flex justify-between my-4">
        {{ $t('usersVue.affiliates') }}
        <base-button
          :action="
            () => {
              showingAffiliateModal = true;
            }
          "
          :text="$t('~~Add Affiliate')"
          type="primary"
        />
        <modal
          v-if="showingAffiliateModal"
          :title="$t('~~Request to be affiliated')"
          modal-classes="w-1/2"
          @close="$emit('onCancel')"
        >
          <div class="px-6 py-3">
            <div class="font-xs my-2">
              {{ $t('Request to be affiliated') }}
            </div>
            <autocomplete
              class="form-field"
              icon="search"
              :suggestions="organizationResults"
              display-property="name"
              size="large"
              placeholder="$t('locationVue.search_for_organization')"
              clear-on-selected
              @selected="
                value => {
                  selectedAffiliate = value;
                }
              "
              @search="onOrganizationSearch"
            />
            <div>
              {{ $t('message') }}
              <textarea rows="4" class="block w-full border outline-none" />
            </div>
          </div>

          <div slot="footer" class="p-3 flex">
            <base-button
              :action="
                () => {
                  showingAffiliateModal = false;
                }
              "
              :text="$t('actions.cancel')"
              class="ml-2 p-3 px-6 text-xs border border-black"
            />
            <base-button
              type="primary"
              :action="
                () => {
                  $log.debug(selectedAffiliate);
                }
              "
              :text="$t('actions.invite')"
              class="ml-2 p-3 px-6 text-xs"
            />
          </div>
        </modal>
      </div>
      <Table
        class="border text-xs"
        :data="affiliates"
        :columns="currentRequestsColumns"
        :loading="false"
      >
        <template #name="slotProps">
          {{ slotProps.item.affiliate_organization.name }}
        </template>
        <template #type_t="slotProps">
          {{ slotProps.item.affiliate_organization.type_t }}
        </template>
        <template #user_count="slotProps">
          <div class="text-center">
            {{ slotProps.item.affiliate_organization.user_count }} member(s)
          </div>
        </template>
        <template #actions="slotProps">
          <div class="flex mr-2">
            <base-button
              v-if="slotProps.item.approved_by"
              size="small"
              class="flex-grow m-1 mx-2 text-xs px-3 border border-black"
              :action="
                () => {
                  removeAffiliation(slotProps.item);
                }
              "
              :text="$t('actions.unaffiliate')"
            />
            <base-button
              v-if="!slotProps.item.approved_by"
              size="small"
              class="px-2 py-1 mx-2 bg-crisiscleanup-green-700 text-white"
              :action="
                () => {
                  acceptAffiliation(slotProps.item);
                }
              "
              :text="$t('actions.accept')"
            />
            <base-button
              v-if="!slotProps.item.approved_by"
              size="small"
              type="bare"
              class="px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white"
              :action="
                () => {
                  rejectAffiliation(slotProps.item);
                }
              "
              :text="$t('actions.reject')"
            />
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script>
import Affiliate from '@/models/Affiliate';
import Organization from '@/models/Organization';
import Table from '@/components/Table';
export default {
  name: 'Affiliates',
  components: { Table },
  data() {
    return {
      showingAffiliateModal: false,
      organizationResults: [],
      selectedAffiliate: null,
      currentRequestsColumns: [
        {
          title: this.$t('~~Affiliate'),
          dataIndex: 'affiliate_organization',
          key: 'name',
        },
        {
          title: this.$t('~~Type'),
          dataIndex: 'type_t',
          key: 'type_t',
        },
        {
          title: this.$t('~~Members'),
          dataIndex: 'user_count',
          key: 'user_count',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
        },
      ],
    };
  },
  computed: {
    affiliates() {
      return Affiliate.all();
    },
  },
  async mounted() {
    const results = await Affiliate.api().get(
      '/organization_affiliate_requests',
      {
        dataKey: 'results',
      },
    );
    const { organization_affiliate_requests } = results.entities;
    await Organization.api().get(
      `/organizations?id__in=${organization_affiliate_requests
        .map(org => org.affiliate)
        .join(',')}`,
      {
        dataKey: 'results',
      },
    );
  },
  methods: {
    async rejectAffiliation(request) {
      await Affiliate.api().rejectRequest(request);
    },
    async acceptAffiliation(request) {
      await Affiliate.api().acceptRequest(request);
    },
    removeAffiliation() {},
    async onOrganizationSearch(value) {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    },
  },
};
</script>

<style scoped></style>
