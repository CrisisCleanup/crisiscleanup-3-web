<template>
  <Table
    :columns="columns"
    :data="requests"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
    enable-pagination
  >
    <template #actions="slotProps">
      <base-button
        size="small"
        type="bare"
        class="m-1 mx-2 border-2 border-black text-black px-3 py-1"
        :action="
          () => {
            rejectInvitationRequest(slotProps.item);
          }
        "
        :text="$t('actions.reject')"
        :alt="$t('actions.reject')"
      />
      <base-button
        size="small"
        variant="solid"
        class="m-1 mx-2 text-black text-xs px-3 py-1"
        :action="
          () => {
            acceptInvitationRequest(slotProps.item);
          }
        "
        :text="$t('actions.accept')"
        :alt="$t('actions.accept')"
      />
    </template>
  </Table>
</template>

<script>
import Table from '@/components/Table';
import User from '@/models/User';
import InvitationRequest from '@/models/InvitationRequest';

export default {
  name: 'InvitationRequestTable',
  components: { Table },
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
    meta: {
      type: Object,
      default: () => {
        return {};
      },
    },
    loading: Boolean,
  },
  methods: {
    async acceptInvitationRequest(request) {
      await InvitationRequest.api().acceptInvitationRequest(request);
      await this.loadAllInvitationRequests();
      await this.$toasted.success(
        this.$t('invitationsVue.invitation_request_accepted'),
      );
      this.$emit('reload');
    },
    async rejectInvitationRequest(request) {
      await InvitationRequest.api().rejectInvitationRequest(request);
      await this.loadAllInvitationRequests();
      await this.$toasted.success(
        this.$t('invitationsVue.invitation_request_declined'),
      );
      this.$emit('reload');
    },
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('~~Id'),
          dataIndex: 'id',
          key: 'id',
          width: '0.5fr',
        },
        {
          title: this.$t('~~Email'),
          dataIndex: 'email',
          key: 'email',
          width: '1fr',
        },
        {
          title: this.$t('~~Full Name'),
          dataIndex: 'full_name',
          key: 'full_name',
          width: '1fr',
          transformer: (field, item) => {
            return `${item.first_name} ${item.last_name}`;
          },
        },
        {
          title: this.$t('~~Mobile'),
          dataIndex: 'mobile',
          key: 'mobile',
          width: '1fr',
        },
        {
          title: this.$t('~~Requested To'),
          dataIndex: 'requested_to',
          key: 'requested_to',
          width: '1fr',
        },
        {
          title: this.$t('Organization'),
          dataIndex: 'requested_to_organization',
          key: 'requested_to_organization',
          width: '2fr',
        },
        {
          title: this.$t(''),
          dataIndex: 'actions',
          key: 'actions',
          width: '2fr',
        },
      ],
    };
  },
};
</script>

<style scoped></style>
