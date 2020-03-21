<template>
  <Table
    :columns="columns"
    :data="organizations"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
  >
    <template #actions="slotProps">
      <div class="flex mr-2 justify-end w-full">
        <base-button
          :text="$t('~~Approve')"
          variant="solid"
          size="small"
          class="mx-2"
          :action="
            () => {
              approveOrganization(slotProps.item.id);
            }
          "
        />
        <base-button
          :text="$t('~~Reject')"
          variant="outline"
          size="small"
          class="mx-2"
          :action="
            () => {
              rejectOrganization(slotProps.item.id);
            }
          "
        />
      </div>
    </template>
  </Table>
</template>

<script>
import Table from '@/components/Table';
import Organization from '@/models/Organization';
import MessageResponseDialog from '@/components/dialogs/MessageResponseDialog';
import { create } from 'vue-modal-dialogs';
const responseDialog = create(MessageResponseDialog);

export default {
  name: 'OrganizationApprovalTable',
  components: { Table },
  props: {
    organizations: {
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
    async approveOrganization(organizationId) {
      const result = await responseDialog({
        title: this.$t('~~Approve Organization'),
        content: this.$t(
          '~~Please provide a reason for approving this organization',
        ),
      });
      if (result) {
        await Organization.api().approve(organizationId, result);
        this.$emit('reload');
      }
    },
    async rejectOrganization(organizationId) {
      const result = await responseDialog({
        title: this.$t('~~Reject Organization'),
        content: this.$t(
          '~~Please provide a reason for rejecting this organization',
        ),
      });
      if (result) {
        await Organization.api().reject(organizationId, result);
        this.$emit('reload');
      }
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('~~Name'),
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: this.$t('~~Website'),
          dataIndex: 'url',
          key: 'url',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
        },
      ],
    };
  },
};
</script>

<style scoped></style>
