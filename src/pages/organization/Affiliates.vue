<template>
  <div class="flex w-3/4 m-auto">
    <div class="mt-6 px-12 pb-6 w-full bg-white shadow">
      <div class="flex justify-between my-4">
        {{ $t('affiliatesVue.affiliates') }}
        <base-button
          :action="
            () => {
              showingAffiliateModal = true;
            }
          "
          :text="$t('affiliatesVue.add_affiliate')"
          :alt="$t('affiliatesVue.add_affiliate')"
          variant="solid"
          class="px-2 py-1"
        />
        <modal
          v-if="showingAffiliateModal"
          :title="$t('affiliatesVue.request_affiliate')"
          modal-classes="w-1/2"
          @close="
            selectedAffiliate = null;
            showingAffiliateModal = false;
          "
        >
          <div class="px-6 py-3">
            <div class="font-xs my-2">
              {{ $t('affiliatesVue.request_affiliate') }}
            </div>
            <autocomplete
              class="form-field"
              icon="search"
              :suggestions="organizationResults"
              display-property="name"
              size="large"
              :placeholder="$t('affiliatesVue.search_for_organization')"
              clear-on-selected
              @selected="
                (value) => {
                  selectedAffiliate = value;
                }
              "
              @search="onOrganizationSearch"
            />
            <div class="my-3">
              <div class="font-xs my-2">
                {{ $t('affiliatesVue.request_reason') }}
              </div>
              <textarea rows="4" class="block w-full border outline-none" />
            </div>
          </div>

          <div slot="footer" class="p-3 flex">
            <base-button
              :action="
                () => {
                  showingAffiliateModal = false;
                  selectedAffiliate = null;
                }
              "
              :text="$t('actions.cancel')"
              :alt="$t('actions.cancel')"
              class="ml-2 p-3 px-6 text-xs border border-black"
            />
            <base-button
              variant="solid"
              :action="
                () => {
                  sendAffiliateRequest(selectedAffiliate);
                  showingAffiliateModal = false;
                  selectedAffiliate = null;
                }
              "
              :text="$t('actions.invite')"
              :alt="$t('actions.invite')"
              class="ml-2 p-3 px-6 text-xs"
            />
          </div>
        </modal>
      </div>
      <Table
        class="border text-xs"
        :data="affiliates"
        :columns="currentRequestsColumns"
        :loading="loading"
      >
        <template #name="slotProps">
          {{ slotProps.item.affiliate_organization.name }}
        </template>
        <template #type_t="slotProps">
          {{ $t(slotProps.item.affiliate_organization.type_t) }}
        </template>
        <template #user_count="slotProps">
          <div class="text-center">
            {{ slotProps.item.affiliate_organization.user_count }} member(s)
          </div>
        </template>
        <template #actions="slotProps">
          <div class="flex mr-2 items-center justify-center w-full">
            <base-button
              v-if="
                slotProps.item.approved_by ||
                slotProps.item.organization === currentUser.organization.id
              "
              size="small"
              class="m-1 mx-2 text-xs px-3 border border-black"
              :action="
                () => {
                  removeAffiliation(slotProps.item);
                }
              "
              :text="$t('actions.unaffiliate')"
              :alt="$t('actions.unaffiliate')"
            />
            <base-button
              v-if="
                !slotProps.item.approved_by &&
                slotProps.item.affiliate === currentUser.organization.id
              "
              size="small"
              class="px-2 py-1 mx-2 bg-crisiscleanup-green-700 text-white"
              :action="
                () => {
                  acceptAffiliation(slotProps.item);
                }
              "
              :text="$t('actions.accept')"
              :alt="$t('actions.accept')"
            />
            <base-button
              v-if="
                !slotProps.item.approved_by &&
                slotProps.item.affiliate === currentUser.organization.id
              "
              size="small"
              type="bare"
              class="px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white"
              :action="
                () => {
                  rejectAffiliation(slotProps.item);
                }
              "
              :text="$t('actions.reject')"
              :alt="$t('actions.reject')"
            />
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import Affiliate from '@/models/Affiliate';
import Organization from '@/models/Organization';
import User from '@/models/User';
import Table from '@/components/Table.vue';
export default {
  name: 'Affiliates',
  components: { Table },
  setup(props) {
    const { t } = useI18n();
    const showingAffiliateModal = ref(false);
    const organizationResults = ref<Array<Organization>>([]);
      const selectedAffiliate = ref<Affiliate>(null);
      const loading = ref(false);
      const currentRequestsColumns = ref([
        {
          title: t('affiliatesVue.affiliate'),
          dataIndex: 'affiliate_organization',
          key: 'name',
          width: '2fr',
        },
        {
          title: t('affiliatesVue.type'),
          dataIndex: 'type_t',
          key: 'type_t',
          width: '1fr',
        },
        {
          title: t('affiliatesVue.status'),
          dataIndex: 'status',
          key: 'status',
          width: '1fr',
        },
        {
          title: t('affiliatesVue.members'),
          dataIndex: 'user_count',
          key: 'user_count',
          width: '1fr',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '3fr',
        },
      ]);

      const affiliates = computed(() => Affiliate.all());
      const currentUser = computed(() => User.find(this.$store.getters['auth/userId']));

      const getAffiliateRequests = async () => {
      loading.value = true;
      await Affiliate.api().get('/organization_affiliate_requests', {
        dataKey: 'results',
      });
      await Organization.api().get(
        `/organizations?id__in=${Affiliate.all()
          .map((org) => org.affiliate)
          .join(',')}`,
        {
          dataKey: 'results',
        },
      );
      loading.value = false;
    }
    const rejectAffiliation = async (request) => {
      await Affiliate.api().rejectRequest(request);
      await getAffiliateRequests();
    }
    const acceptAffiliation = async (request) => {
      await Affiliate.api().acceptRequest(request);
      await this.getAffiliateRequests();
    }
    const sendAffiliateRequest = async (organization) => {
      await Affiliate.api().post('/organization_affiliate_requests', {
        affiliate: organization.id,
      });
      await this.getAffiliateRequests();
    }
    const removeAffiliation = async (affiliate) => {
      await Affiliate.api().delete(
        `/organization_affiliate_requests/${affiliate.id}`,
        {
          delete: affiliate.id,
        },
      );
      await this.getAffiliateRequests();
    }
    const onOrganizationSearch = async (value) => {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name&is_active=true`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    }

    onMounted(async () => {
      await getAffiliateRequests();
    });
    
    return {
      showingAffiliateModal,
      organizationResults,
      selectedAffiliate,
      loading,
      currentRequestsColumns,
      affiliates,
      currentUser,
      getAffiliateRequests,
      rejectAffiliation,
      acceptAffiliation,
      sendAffiliateRequest,
      removeAffiliation,
      onOrganizationSearch,
    };
  },
};
</script>

<style scoped></style>
