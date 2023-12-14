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
    <template #type="slotProps">
      {{ getLocationType(slotProps.item.type) }}
    </template>
    <template #actions="slotProps">
      <div class="flex mr-2 justify-center w-full">
        <ccu-icon
          :alt="$t('actions.edit')"
          data-testid="testEditButton"
          size="small"
          type="edit"
          class="mx-2"
          @click.native="
            () => {
              $router.push(`/locations/${slotProps.item.id}/edit`);
            }
          "
        />
        <ccu-icon
          :alt="$t('actions.delete')"
          data-testid="testDeleteButton"
          size="small"
          type="trash"
          class="mx-2"
          @click.native="
            () => {
              $emit('deleteLocation', slotProps.item.id);
            }
          "
        />
      </div>
    </template>
  </Table>
</template>

<script lang="ts">
import Table from '@/components/Table.vue';
import LocationType from '@/models/LocationType';

export default defineComponent({
  name: 'LocationTable',
  components: { Table },
  props: {
    locations: {
      type: Array,
      default: () => [],
    },
    meta: {
      type: Object,
      default() {
        return {};
      },
    },
    loading: {
      type: Boolean,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const columns = ref([
      {
        title: t('locationTable.name'),
        dataIndex: 'name',
        key: 'name',
        width: '1.5fr',
      },
      {
        title: t('locationTable.type'),
        dataIndex: 'type',
        key: 'type',
        width: '1.5fr',
      },
      {
        title: t('locationTable.shared'),
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
        width: '0.5fr',
      },
    ]);
    const getLocationType = (type: string) => {
      return LocationType.find(type)?.name_t;
    };

    return {
      columns,
      getLocationType,
    };
  },
});
</script>

<style scoped></style>
