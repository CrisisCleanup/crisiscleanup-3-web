<template>
  <div class="flex h-full w-3/4 m-auto">
    <div class="p-12 w-full">
      {{ $t('usersVue.affiliates') }}
      <Table
        class="border text-xs"
        :data="affiliates"
        :columns="currentRequestsColumns"
        :loading="false"
      >
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
import Table from '@/components/Table';
export default {
  name: 'Affiliates',
  components: { Table },
  data() {
    return {
      currentRequestsColumns: [
        {
          title: this.$t('~~organization'),
          dataIndex: 'organization',
          key: 'organization',
        },
        {
          title: this.$t('~~affiliate'),
          dataIndex: 'affiliate',
          key: 'affiliate',
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
  mounted() {
    Affiliate.api().get('/organization_affiliate_requests', {
      dataKey: 'results',
    });
  },
  methods: {
    async rejectAffiliation(request) {
      await Affiliate.api().rejectRequest(request);
    },
    async acceptAffiliation(request) {
      await Affiliate.api().acceptRequest(request);
    },
    removeAffiliation() {},
  },
};
</script>

<style scoped></style>
