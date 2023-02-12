<template>
  <div class="p-3">
    <base-text variant="h1" class="my-3">{{ $t('~~User Downloads') }}</base-text>
    <AjaxTable
      :url="tableUrl"
      :columns="columns"
      :body-style="{ height: '30rem' }"
      class="border"
    >
      <template #file="{ item }">
        <div v-if="item.file">
          <base-link
            :href="item.file.csv_url"
            text-variant="bodysm"
            class="px-2"
            :download="item.file.filename_original"
            >{{ item.file.filename_original }}</base-link
          >
        </div>
        <div v-else>
          {{ $t('~~Processing...') }}
        </div>
      </template>
    </AjaxTable>
  </div>
</template>

<script lang="ts">
import { makeTableColumns } from '@/utils/table';
import AjaxTable from '@/components/AjaxTable.vue';
import BaseText from "@/components/BaseText.vue";

export default {
  name: 'Downloads',
  components: {BaseText, AjaxTable },
  setup() {
    const tableUrl = `${import.meta.env.VITE_APP_API_BASE_URL}/user_downloads`;
    const columns = makeTableColumns([
      ['uuid', '1fr', 'ID'],
      ['created_at', '1fr', 'Created At'],
      ['file', '1fr', 'Status'],
    ]);
    return {
      tableUrl,
      columns,
    };
  },
};
</script>

<style scoped></style>
