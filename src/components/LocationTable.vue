<template>
  <Table
    :columns="columns"
    :data="locations"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    enable-pagination
    :loading="loading"
    @change="$emit('change', $event)"
  >
    <template #actions="slotProps">
      <div class="flex mr-2 justify-center w-full">
        <ccu-icon
          size="small"
          type="edit"
          @click.native="
            () => {
              $router.push(`/locations/${slotProps.item.id}/edit`);
            }
          "
        />
      </div>
    </template>
  </Table>
</template>

<script>
import Table from '@/components/Table';

export default {
  name: 'LocationTable',
  components: { Table },
  props: {
    locations: {
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
  data() {
    return {
      columns: [
        {
          title: this.$t('~~Name'),
          dataIndex: 'name',
          key: 'name',
          width: '1.5fr',
        },
        {
          title: this.$t('~~Type'),
          dataIndex: 'location_type',
          key: 'location_type',
          subKey: 'name_t',
          width: '1.5fr',
        },
        {
          title: this.$t('~~Shared'),
          dataIndex: 'shared',
          key: 'shared',
        },
        {
          title: '',
          dataIndex: 'map',
          key: 'map',
          width: '0.25fr',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '0.25fr',
        },
      ],
    };
  },
};
</script>

<style scoped></style>
